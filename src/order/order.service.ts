import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from '../notification/notification.service';
import { I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../product/product.entity';
import { PaymentService } from '../payment/payment.service';
import { Wallet } from '../wallet/wallet.entity';
import { Vendor } from '../vendor/vendor.entity';
import { Checkout } from './entities/checkout.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { MyOrdersArgs } from './dtos/my-orders.args';
import { VendorOrdersArgs } from './dtos/vendor-orders.args';
import { AdminOrdersArgs } from './dtos/admin-orders.args';
import { QueryService } from '../common/query/query.service';
import { PaymentStatus } from './enums/payment-status.enum';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderService {
	constructor(
		private readonly query: QueryService,
		@InjectRepository(Order) private readonly orderRepo: Repository<Order>,
		private readonly notifications: NotificationService,
		private readonly cartService: CartService,
		private readonly paymentService: PaymentService,
		private readonly dataSource: DataSource,
		private readonly i18n: I18nService,
		private readonly logger: Logger
	) {}

	checkout(userId: number, shippingAddress: string) {
		return this.dataSource.transaction(async (manager) => {
			// lock the cart
			const cart = await manager.findOneOrFail(Cart, { where: { userId }, lock: { mode: 'pessimistic_write' } });

			const pending = await manager.findOne(Checkout, {
				where: { clientId: userId, status: PaymentStatus.Pending },
				relations: { orders: { checkout: true } }, // items and history load by dataloaders
			});
			if (pending) return Object.assign(pending, { clientSecret: await this.paymentService.getClientSecret(pending.paymentIntentId!) });

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
			const checkout_item = manager.create(Checkout, { clientId: userId, total: checkout_total, shippingAddress })
			const checkout = await manager.save(checkout_item);

			// creating orders and items 
			for (const [vendorId, group] of byVendor) {
				const { commissionRate, total, items } = group;
				
				const od = manager.create(Order, { checkoutId: checkout.id, clientId: checkout.clientId, vendorId, total, commissionAmount: Math.round((total * commissionRate) / 100) })
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

			const intent = await this.paymentService.createIntent(checkout.total, checkout.id);
			await manager.update(Checkout, checkout.id, { paymentIntentId: intent.id });

			const saved = await manager.findOneOrFail(Checkout, { where: { id: checkout.id }, relations: { orders: { checkout: true } } });
			return Object.assign(saved, { clientSecret: intent.clientSecret });
		});
	}

	myOrders(args: MyOrdersArgs, clientId: number) {
		const qb = this.orderRepo
			.createQueryBuilder('order')
			.innerJoinAndSelect('order.checkout', 'checkout') // for shippingAddress
			.where('order.clientId = :clientId', { clientId });
		this.query.sort(qb, 'createdAt');
		if (args.status) qb.andWhere('order.status = :status', { status: args.status });
		return this.query.getPage(qb, args);
	}

	vendorOrders(args: VendorOrdersArgs, vendorId: number) {
		const qb = this.orderRepo
			.createQueryBuilder('order')
			.innerJoinAndSelect('order.checkout', 'checkout')
			.innerJoin('order.client', 'client')
			.addSelect(['client.id', 'client.fullname'])
			.where('order.vendorId = :vendorId', { vendorId });
		this.query.sort(qb, 'createdAt');
		if (args.status) qb.andWhere('order.status = :status', { status: args.status });
		return this.query.getPage(qb, args);
	}

	adminOrders(args: AdminOrdersArgs) {
		const { status, paymentStatus, vendorId, clientId, from, to } = args;
		if (from && to && from > to) throw new BadRequestException(this.i18n.t('exceptions.DATE_FROM_AFTER_TO'));

		const qb = this.orderRepo
			.createQueryBuilder('order')
			.innerJoinAndSelect('order.checkout', 'checkout')
			.innerJoin('order.client', 'client')
			.addSelect(['client.id', 'client.fullname']);
		this.query.sort(qb, 'createdAt');
		if (status) qb.andWhere('order.status = :status', { status });
		if (paymentStatus) qb.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
		if (vendorId) qb.andWhere('order.vendorId = :vendorId', { vendorId });
		if (clientId) qb.andWhere('order.clientId = :clientId', { clientId });
		if (from) qb.andWhere('order.createdAt >= :from', { from });
		if (to) qb.andWhere('order.createdAt <= :to', { to });
		return this.query.getPage(qb, args);
	}

	async findOne(id: number, clientId: number) {
		const order = await this.orderRepo.findOne({ where: { id, clientId }, relations: { checkout: true } });
		if (!order) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_ORDER'));
		return order;
	}

	async updateStatus(orderId: number, status: OrderStatus, actorId: number, vendorId?: number) {
		const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: { items: true, vendor: true } });
		if (!order) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_ORDER'));
		if (vendorId !== undefined && order.vendorId !== vendorId) throw new ForbiddenException(this.i18n.t('exceptions.NOT_OWNER'));

		if (order.status === OrderStatus.Delivered || order.status === OrderStatus.Cancelled)
			throw new BadRequestException(this.i18n.t('exceptions.ORDER_FINAL', { args: { status: order.status } }));

		if (status === OrderStatus.Pending)
			throw new BadRequestException(this.i18n.t('exceptions.INVALID_ORDER_TRANSITION', { args: { from: order.status, to: status } }));

		return this.applyStatus(order, status, actorId);
	}

	async cancelOrder(orderId: number, clientId: number) {
		const order = await this.orderRepo.findOne({ where: { id: orderId, clientId }, relations: { items: true, vendor: true } }); // someone else's order = not found
		if (!order) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_ORDER'));

		if (order.status === OrderStatus.Cancelled) return order; // already cancelled
		if (order.status !== OrderStatus.Pending) throw new BadRequestException(this.i18n.t('exceptions.ORDER_NOT_CANCELLABLE'));

		return this.applyStatus(order, OrderStatus.Cancelled, clientId);
	}

	// call refund + send notification (either cancel order or just refund it if canceled)
	async refundOrder(orderId: number, adminId: number) {
		const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: { items: true, vendor: true } });
		if (!order) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_ORDER'));
		if (order.paymentStatus === PaymentStatus.Refunded) throw new BadRequestException(this.i18n.t('exceptions.ORDER_ALREADY_REFUNDED'));
		if (order.paymentStatus !== PaymentStatus.Paid) throw new BadRequestException(this.i18n.t('exceptions.REFUND_ORDER_NOT_PAID'));


		//either cancel order and return
		if (order.status !== OrderStatus.Cancelled) return this.applyStatus(order, OrderStatus.Cancelled, adminId);


		//or just refund it if canceled
		await this.dataSource.transaction((manager) => this.refund(manager, order, adminId));



		return this.orderRepo.findOneOrFail({ where: { id: order.id }, relations: { checkout: true, client: true } });
	}

	private async refund(manager: EntityManager, order: Order, actorId: number) {
		const vendor = await manager.findOneByOrFail(Vendor, { id: order.vendorId });
		const wallet = await manager.findOneByOrFail(Wallet, { userId: vendor.ownerId });
		if (wallet.balance < order.total - order.commissionAmount) throw new BadRequestException(this.i18n.t('exceptions.INSUFFICIENT_BALANCE'));

		const checkout = await manager.findOneByOrFail(Checkout, { id: order.checkoutId });
		await this.paymentService.refund(checkout.paymentIntentId!, order.total, order.id, actorId);
	}

	// status update + history + (cancel: stock back, refund) in one transaction, then the notification job
	private async applyStatus(order: Order, status: OrderStatus, actorId: number) {
		await this.dataSource.transaction(async (manager) => {
			const res = await manager.update(Order, { id: order.id, status: order.status }, { status }); // race guard
			if (!res.affected) throw new ConflictException(this.i18n.t('exceptions.ORDER_ALREADY_CHANGED'));
			await manager.save(manager.create(OrderStatusHistory, { orderId: order.id, status, changedBy: actorId }));

			if (status === OrderStatus.Cancelled) {
				// lock the product 
				const products = await manager.find(Product, {
					where: { id: In(order.items.map((i) => i.productId!)) },
					order: { id: 'ASC' },
					withDeleted:true,
					lock: { mode: 'pessimistic_write' },
				});
				// return the quantity
				for (const { productId, quantity } of order.items) {
					const product = products.find((p) => p.id === productId);
					if (product) await manager.update(Product, product.id, { stock: product.stock + quantity });
				}

				if (order.paymentStatus === PaymentStatus.Paid) await this.refund(manager, order, actorId);
			}
		});

		// notify vendor,client
		this.notifications.send('order-status-changed', { orderId: order.id, userId: order.clientId, from: order.status, to: status, at: new Date().toUTCString() });
		this.notifications.send('order-status-changed', { orderId: order.id, userId: order.vendor.ownerId, from: order.status, to: status, at: new Date().toUTCString() });
		return this.orderRepo.findOneOrFail({ where: { id: order.id }, relations: { checkout: true, client: true } });
	}
}
