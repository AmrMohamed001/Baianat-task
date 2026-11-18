import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
	private readonly stripeClient: Stripe;

	constructor(
		private readonly config: ConfigService,
		private readonly i18n: I18nService,
		private readonly logger: Logger
	) {
		this.stripeClient = new Stripe(config.getOrThrow('STRIPE_SECRET_KEY'));
	}

	async createIntent(amount: number, checkoutId: number) {
		try {
			const intent = await this.stripeClient.paymentIntents.create(
				{
					amount,
					currency: 'usd',
					metadata: { checkoutId: String(checkoutId) },
					automatic_payment_methods: { enabled: true },
				},
				{ idempotencyKey: `checkout-${checkoutId}` }
			);
			return { id: intent.id, clientSecret: intent.client_secret};
		} catch (e:any) {
			this.logger.error(`Stripe createIntent failed: ${e?.type ?? e?.name} ${e?.code ?? ''}`.trim());
			throw new ServiceUnavailableException(this.i18n.t('exceptions.PAYMENT_UNAVAILABLE'));
		}
	}

	// signature header against secret
	getEvent(rawBody: Buffer, signature: string): Stripe.Event {
	try {
		return this.stripeClient.webhooks.constructEvent(rawBody, signature, this.config.getOrThrow('STRIPE_WEBHOOK_SECRET'));
	} catch (e: any) {
		if (e?.type === 'StripeSignatureVerificationError') throw new BadRequestException(this.i18n.t('exceptions.INVALID_WEBHOOK_SIGNATURE'));
		throw e;
	}
}


	async getClientSecret(paymentIntentId: string) {
		try {
			return (await this.stripeClient.paymentIntents.retrieve(paymentIntentId)).client_secret!;
		} catch (e: any) {
			this.logger.error(`Stripe retrieve failed: ${e?.type ?? e?.name} ${e?.code ?? ''}`.trim());
			throw new ServiceUnavailableException(this.i18n.t('exceptions.PAYMENT_UNAVAILABLE'));
		}
	}

	async refund(checkoutId: number, amount: number) {
		return { id: `re_test_${checkoutId}` };
	}
}
