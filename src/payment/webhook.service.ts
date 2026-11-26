import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { DataSource, EntityManager, In } from 'typeorm';
import Stripe from 'stripe';
import { StripeEvent } from './entities/stripe-event.entity';
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { Checkout } from '../order/entities/checkout.entity';
import { Order } from '../order/entities/order.entity';
import { OrderStatusHistory } from '../order/entities/order-status-history.entity';
import { PaymentStatus } from '../order/enums/payment-status.enum';
import { OrderStatus } from '../order/enums/order-status.enum';
import { Product } from '../product/product.entity';
import { Vendor } from '../vendor/vendor.entity';
import { WalletService } from '../wallet/wallet.service';
import { PaymentService } from './payment.service';
import { TransactionType } from '../wallet/enums/transaction-type.enum';
import { WalletType } from '../wallet/enums/wallet-type.enum';

@Injectable()
export class StripeWebhookService {
	constructor(
		private readonly notifications: NotificationService,
		private readonly dataSource: DataSource,
		private readonly walletService: WalletService,
		private readonly paymentService: PaymentService,
		private readonly logger: Logger
	) {}

	async process(event: Stripe.Event) {
		await this.dataSource.transaction(async (manager) => {
			await manager.insert(StripeEvent, { id: event.id, type: event.type });

			switch (event.type) {
				case 'payment_intent.succeeded':
					return this.paymentSucceeded(manager, event.data.object);
				case 'payment_intent.payment_failed':
				case 'payment_intent.canceled':
					return this.paymentFailed(manager, event.data.object);
				case 'charge.refunded':
					return this.chargeRefunded(manager, event.data.object);
			}
		});
	}

	private async chargeRefunded(manager: EntityManager, charge: Stripe.Charge) {
		const paymentIntentId = charge.payment_intent as string;
		const refunds = await this.paymentService.listRefunds(paymentIntentId);


		for (const refund of refunds) {
			const orderId = Number(refund.metadata?.orderId);

			if (!orderId || refund.status !== 'succeeded') {
				this.logger.log(`stripe refund ${refund.id} skipped`);
				continue;
			}

			const order = await manager.findOne(Order, { where: { id: orderId }, lock: { mode: 'pessimistic_write' } });
			
			if (!order || order.paymentStatus !== PaymentStatus.Paid) {
				this.logger.log(`stripe refund ${refund.id} return non order`);
				continue;
			}

			const vendor = await manager.findOneByOrFail(Vendor, { id: order.vendorId });
			const meta = { orderId, paymentIntentId, stripeRefundId: refund.id, createdBy: Number(refund.metadata?.actorId)};

			// money vendor + transaction
			const vendorShare = order.total - order.commissionAmount;
			if (vendorShare > 0) await this.walletService.applyTransaction(manager, { userId: vendor.ownerId }, TransactionType.Refund, vendorShare, meta);

			// money platform + transaction
			if (order.commissionAmount > 0)
				await this.walletService.applyTransaction(manager, { type: WalletType.Platform }, TransactionType.Refund, order.commissionAmount, meta);

			await manager.update(Order, order.id, { paymentStatus: PaymentStatus.Refunded, stripeRefundId: refund.id, refundedAt: new Date() });

			// mail user,vendor
			this.notifications.send('order-refunded', { orderId, userId: order.clientId });
			this.notifications.send('order-refunded', { orderId, userId: vendor.ownerId });
		}
	}
	// errors enforce retry solve with log
	private async paymentSucceeded(manager: EntityManager, intent: Stripe.PaymentIntent) {
		const checkout = await manager.findOneBy(Checkout, { paymentIntentId: intent.id });
		if (!checkout) return this.logger.warn(`Stripe succeeded for unknown payment intent ${intent.id}`);
		if (checkout.status === PaymentStatus.Paid) return;

		if (checkout.status !== PaymentStatus.Pending)
			return this.logger.warn(`checkout ${checkout.id} is ${checkout.status} but payment intent ${intent.id} succeeded`);

		const res = await manager.update(Checkout, { id: checkout.id, status: PaymentStatus.Pending }, { status: PaymentStatus.Paid }); // race guard
		if (!res.affected) return;

		await manager.update(Order, { checkoutId: checkout.id }, { paymentStatus: PaymentStatus.Paid });

		const cart = await manager.findOneBy(Cart, { userId: checkout.clientId });
		if (cart) await manager.delete(CartItem, { cartId: cart.id });

		const orders = await manager.find(Order, { where: { checkoutId: checkout.id }, relations: { vendor: true }, order: { vendor: { ownerId: 'ASC' } } });
		for (const order of orders){
			await this.walletService.applyTransaction(manager, { userId: order.vendor.ownerId }, TransactionType.Sale, order.total - order.commissionAmount, { orderId: order.id, paymentIntentId: intent.id });
			await this.walletService.applyTransaction(manager, { type: WalletType.Platform }, TransactionType.Sale, order.commissionAmount, { orderId: order.id, paymentIntentId: intent.id });
		}
		return { name: 'payment-succeeded', data: { checkoutId: checkout.id, userId: checkout.clientId } };
	}

	private async paymentFailed(manager: EntityManager, intent: Stripe.PaymentIntent) {
		const checkout = await manager.findOneBy(Checkout, { paymentIntentId: intent.id });
		if (!checkout) return this.logger.warn(`Stripe failure for unknown payment intent ${intent.id}`);

		const res = await manager.update(Checkout, { id: checkout.id, status: PaymentStatus.Pending }, { status: PaymentStatus.Failed });
		if (!res.affected) return;

		await manager.update(Order, { checkoutId: checkout.id }, { paymentStatus: PaymentStatus.Failed });

		const orders = await manager.find(Order, { where: { checkoutId: checkout.id, status: OrderStatus.Pending }, relations: { items: true } });
		for (const order of orders) {
			await manager.update(Order, order.id, { status: OrderStatus.Cancelled });
			await manager.save(manager.create(OrderStatusHistory, { orderId: order.id, status: OrderStatus.Cancelled, changedBy: null })); // system

			// lock the products
			const products = await manager.find(Product, {
				where: { id: In(order.items.map((i) => i.productId!)) },
				order: { id: 'ASC' },
				withDeleted: true,
				lock: { mode: 'pessimistic_write' },
			});
			// return the quantity
			for (const { productId, quantity } of order.items) {
				const product = products.find((p) => p.id === productId);
				if (product) await manager.update(Product, product.id, { stock: product.stock + quantity });
			}
		}

		return { name: 'payment-failed', data: { checkoutId: checkout.id, userId: checkout.clientId } };
	}
}
