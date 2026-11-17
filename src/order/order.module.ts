import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Checkout } from './entities/checkout.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './order.service';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderResolver } from './order.resolver';
import { CartModule } from '../cart/cart.module';
import { PaymentModule } from '../payment/payment.module';
import { DataloaderModule } from '../dataloader/dataloader.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Checkout, Order, OrderItem, OrderStatusHistory]),
		BullModule.registerQueue({ name: 'mail' }),
		CartModule,
		PaymentModule,
		DataloaderModule,
	],
	providers: [OrderService, OrderResolver],
})
export class OrderModule {}
