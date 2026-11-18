import { BadRequestException, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Public } from '../auth/decorators/public.decorator';
import { PaymentService } from './payment.service';
import { StripeWebhookService } from './webhook.service';

@Controller('webhooks')
export class StripeWebhookController {
	constructor(
		private readonly paymentService: PaymentService,
		private readonly webhookService: StripeWebhookService,
		private readonly i18n: I18nService
	) {}

	@Public()
	@Post('stripe')
	@HttpCode(200)
	async handle(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature?: string) {
		if (!signature || !req.rawBody) throw new BadRequestException(this.i18n.t('exceptions.INVALID_WEBHOOK_REQUEST'));
		const event = this.paymentService.getEvent(req.rawBody, signature);
		await this.webhookService.process(event);
		return { received: true };
	}
}
