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
import { Review } from '../review/review.entity';
import { ReviewLoader } from './review.loader';
import { User } from '../user/user.entity';
import { UserLoader } from './user.loader';
import { ProductImage } from '../product/product-image.entity';
import { ProductImageLoader } from './product-image.loader';
import { StorageModule } from '../storage/storage.module';

@Module({
	imports: [TypeOrmModule.forFeature([Product, Vendor, Category, CartItem, VendorFollow, OrderStatusHistory, OrderItem, Review, User, ProductImage]), StorageModule],
	providers: [ProductLoader, VendorLoader, CategoryLoader, CartItemLoader, OrderHistoryLoader, OrderItemLoader, ReviewLoader, UserLoader, ProductImageLoader],
	exports: [ProductLoader, VendorLoader, CategoryLoader, CartItemLoader, OrderHistoryLoader, OrderItemLoader, ReviewLoader, UserLoader, ProductImageLoader],
})
export class DataloaderModule {}
