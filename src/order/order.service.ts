import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, In, Repository } from 'typeorm';
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../product/product.entity';
import { PaymentService } from '../payment/payment.service';
import { Checkout } from './entities/checkout.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { MyOrdersArgs } from './dtos/my-orders.args';
import { paginate } from '../common/query/paginate';
import { PaymentStatus } from './enums/payment-status.enum';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderService {
	constructor(
		@InjectRepository(Order) private readonly orderRepo: Repository<Order>,
		@InjectQueue('mail') private readonly mailQueue: Queue,
		private readonly cartService: CartService,
		private readonly paymentService: PaymentService,
		private readonly dataSource: DataSource,
		private readonly i18n: I18nService,
		private readonly logger: Logger
	) {}

	checkout(userId: number) {
		return this.dataSource.transaction(async (manager) => {
			// lock the cart
			const cart = await manager.findOneOrFail(Cart, { where: { userId }, lock: { mode: 'pessimistic_write' } });

			const pending = await manager.findOne(Checkout, {
				where: { clientId: userId, status: PaymentStatus.Pending },
				relations: { orders: { checkout: true } }, // items and history load by dataloaders
			});
			if (pending) return pending;

			const cartItems = await manager.findBy(CartItem, { cartId: cart.id });
			if (!cartItems.length) throw new BadRequestException(this.i18n.t('exceptions.CART_EMPTY'));

			// lock the product rows 
			await manager.find(Product, {
				where: { id: In(cartItems.map((i) => i.productId)) },
				order: { id: 'ASC' },
				lock: { mode: 'pessimistic_write' },
			});
			// get the items after lock
			const items = await manager.find(CartItem, {
				where: { cartId: cart.id },
				relations: { product: { vendor: { owner: true } } },
				withDeleted: true,
			});


			// group by vendor
			const byVendor = new Map<number, { commissionRate: number; total: number; items: CartItem[] }>();
			for (const item of items) {
				const { product } = item;
				if (!this.cartService.isAvailable(item)) 
					throw new BadRequestException(this.i18n.t('exceptions.ITEM_UNAVAILABLE', { args: { name: product.nameEn } })); // set en for now i will resolve lang later


				const group = byVendor.get(product.vendorId) ?? { commissionRate: product.vendor.commissionRate, total: 0, items: [] };
				group.items.push(item);
				group.total += product.price * item.quantity;
				byVendor.set(product.vendorId, group);
			}

			// creating checkout
			const checkout_total = Array.from(byVendor.values()).reduce((sum, { total }) => sum + total, 0);
			const checkout_item = manager.create(Checkout, { clientId: userId, total: checkout_total})
			const checkout = await manager.save(checkout_item);

			// creating orders and items 
			for (const [vendorId, group] of byVendor) {
				const { commissionRate, total, items } = group;
				
				const od = manager.create(Order, { checkoutId: checkout.id, vendorId, total, commissionAmount: Math.round((total * commissionRate) / 100) })
				const order = await manager.save(od);
				await manager.save(manager.create(OrderStatusHistory, { orderId: order.id, status: OrderStatus.Pending, changedBy: userId }));
				await manager.save(
					items.map(({ product, quantity }) =>
						manager.create(OrderItem, {
							orderId: order.id,
							productId: product.id,
							nameAr: product.nameAr,
							nameEn: product.nameEn,
							priceAtPurchase: product.price,
							quantity,
						})
					)
				)
				// reduce the quantity of the product
				for (const { product, quantity } of items) 
					await manager.update(Product, product.id, { stock: product.stock - quantity });
			}

			// stripe checkout ,,mock for now
			const intent = await this.paymentService.createIntent(checkout.total, checkout.id); // throws → everything rolls back
			await manager.update(Checkout, checkout.id, { paymentIntentId: intent.id });

			return manager.findOneOrFail(Checkout, { where: { id: checkout.id }, relations: { orders: { checkout: true } } });
		});
	}

	myOrders(args: MyOrdersArgs, clientId: number) {
		const qb = this.orderRepo
			.createQueryBuilder('order')
			.innerJoinAndSelect('order.checkout', 'checkout')
			.where('checkout.clientId = :clientId', { clientId })
			.orderBy('order.createdAt', 'DESC')
			.addOrderBy('order.id', 'DESC');
		if (args.status) qb.andWhere('order.status = :status', { status: args.status });
		return paginate(qb, args);
	}

	async findOne(id: number, clientId: number) {
		const order = await this.orderRepo.findOne({ where: { id, checkout: { clientId } }, relations: { checkout: true } });
		if (!order) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_ORDER'));
		return order;
	}

	async updateStatus(orderId: number, status: OrderStatus, actorId: number, vendorId?: number) {
		const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: { checkout: true, items: true } });
		if (!order) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_ORDER'));
		if (vendorId !== undefined && order.vendorId !== vendorId) throw new ForbiddenException(this.i18n.t('exceptions.NOT_OWNER'));

		if (order.status === OrderStatus.Delivered || order.status === OrderStatus.Cancelled)
			throw new BadRequestException(this.i18n.t('exceptions.ORDER_FINAL', { args: { status: order.status } }));

		if (status === OrderStatus.Pending)
			throw new BadRequestException(this.i18n.t('exceptions.INVALID_ORDER_TRANSITION', { args: { from: order.status, to: status } }));

		await this.dataSource.transaction(async (manager) => {
			const res = await manager.update(Order, { id: orderId, status: order.status }, { status }); // race guard
			if (!res.affected) throw new ConflictException(this.i18n.t('exceptions.ORDER_ALREADY_CHANGED'));
			await manager.save(manager.create(OrderStatusHistory, { orderId, status, changedBy: actorId }));

			if (status === OrderStatus.Cancelled) {
				for (const { productId, quantity } of order.items)
					if (productId) await manager.increment(Product, { id: productId }, 'stock', quantity);

				if (order.checkout.status === PaymentStatus.Paid) await this.paymentService.refund(order.checkoutId, order.total);
			}
		});

		this.mailQueue
			.add('order-status-changed', { orderId, clientId: order.checkout.clientId, vendorId: order.vendorId, from: order.status, to: status, actorId })
			.catch((e) => this.logger.error(e.message, e.stack));
		return this.orderRepo.findOneOrFail({ where: { id: orderId }, relations: { checkout: true } });
	}
}
