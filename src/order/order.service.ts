import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, In } from 'typeorm';
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../product/product.entity';
import { PaymentService } from '../payment/payment.service';
import { Checkout } from './checkout.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { PaymentStatus } from './enums/payment-status.enum';

@Injectable()
export class OrderService {
	constructor(
		private readonly cartService: CartService,
		private readonly paymentService: PaymentService,
		private readonly dataSource: DataSource,
		private readonly i18n: I18nService
	) {}

	checkout(userId: number) {
		return this.dataSource.transaction(async (manager) => {
			// lock the cart
			const cart = await manager.findOneOrFail(Cart, { where: { userId }, lock: { mode: 'pessimistic_write' } });

			const pending = await manager.findOne(Checkout, {
				where: { clientId: userId, status: PaymentStatus.Pending },
				relations: { orders: { items: true } },
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

			return manager.findOneOrFail(Checkout, { where: { id: checkout.id }, relations: { orders: { items: true } } });
		});
	}
}
