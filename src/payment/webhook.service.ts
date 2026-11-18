import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import Stripe from 'stripe';
import { StripeEvent } from './entities/stripe-event.entity';
import { Checkout } from '../order/entities/checkout.entity';
import { PaymentStatus } from '../order/enums/payment-status.enum';

@Injectable()
export class StripeWebhookService {
	constructor(
		private readonly dataSource: DataSource,
		private readonly logger: Logger
	) {}

	process(event: Stripe.Event) {
		return this.dataSource.transaction(async (manager) => {
			await manager.insert(StripeEvent, { id: event.id, type: event.type });

			switch (event.type) {
				case 'payment_intent.succeeded': 
					return manager.update(Checkout, { paymentIntentId: event.data.object.id, status: In([PaymentStatus.Pending, PaymentStatus.Failed]) }, { status: PaymentStatus.Paid });
				case 'payment_intent.payment_failed': 
					return manager.update(Checkout, { paymentIntentId: event.data.object.id, status: PaymentStatus.Pending }, { status: PaymentStatus.Failed });
				case 'charge.refunded': 
					return this.logger.log(`Stripe event ${event.id}: charge refunded for ${event.data.object.payment_intent}`);
			}
		});
	}
}
