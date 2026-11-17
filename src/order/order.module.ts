import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Checkout } from './checkout.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { CartModule } from '../cart/cart.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
	imports: [TypeOrmModule.forFeature([Checkout, Order, OrderItem]), BullModule.registerQueue({ name: 'mail' }), CartModule, PaymentModule],
	providers: [OrderService, OrderResolver],
})
export class OrderModule {}
