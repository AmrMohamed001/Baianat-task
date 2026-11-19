import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PaymentService } from './payment.service';
import { StripeWebhookService } from './webhook.service';
import { StripeWebhookController } from './webhook.controller';
import { StripeEvent } from './entities/stripe-event.entity';
import { Checkout } from '../order/entities/checkout.entity';

@Module({
	imports: [TypeOrmModule.forFeature([StripeEvent, Checkout]), BullModule.registerQueue({ name: 'mail' })],
	controllers: [StripeWebhookController],
	providers: [PaymentService, StripeWebhookService],
	exports: [PaymentService],
})
export class PaymentModule {}
