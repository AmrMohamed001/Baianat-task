import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { Checkout } from './entities/checkout.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './order.service';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderResolver } from './order.resolver';
import { CartModule } from '../cart/cart.module';
import { PaymentModule } from '../payment/payment.module';
import { WalletModule } from '../wallet/wallet.module';
import { DataloaderModule } from '../dataloader/dataloader.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Checkout, Order, OrderItem, OrderStatusHistory]),
		NotificationModule,
		CartModule,
		PaymentModule,
		WalletModule,
		DataloaderModule,
	],
	providers: [OrderService, OrderResolver],
})
export class OrderModule {}
