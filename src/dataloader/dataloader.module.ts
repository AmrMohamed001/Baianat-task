import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/product.entity';
import { Vendor } from '../vendor/vendor.entity';
import { Category } from '../category/category.entity';
import { CartItem } from '../cart/cart-item.entity';
import { VendorFollow } from '../follow/follow.entity';
import { ProductLoader } from './product.loader';
import { VendorLoader } from './vendor.loader';
import { CategoryLoader } from './category.loader';
import { CartItemLoader } from './cart-item.loader';
import { OrderStatusHistory } from '../order/entities/order-status-history.entity';
import { OrderHistoryLoader } from './order-history.loader';
import { OrderItem } from '../order/entities/order-item.entity';
import { OrderItemLoader } from './order-item.loader';

@Module({
	imports: [TypeOrmModule.forFeature([Product, Vendor, Category, CartItem, VendorFollow, OrderStatusHistory, OrderItem])],
	providers: [ProductLoader, VendorLoader, CategoryLoader, CartItemLoader, OrderHistoryLoader, OrderItemLoader],
	exports: [ProductLoader, VendorLoader, CategoryLoader, CartItemLoader, OrderHistoryLoader, OrderItemLoader],
})
export class DataloaderModule {}
