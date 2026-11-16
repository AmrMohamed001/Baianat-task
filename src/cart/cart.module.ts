import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { CartItemResolver } from './cart-item.resolver';
import { ProductModule } from '../product/product.module';
import { DataloaderModule } from '../dataloader/dataloader.module';

@Module({
	imports: [TypeOrmModule.forFeature([Cart, CartItem]), ProductModule, DataloaderModule],
	providers: [CartService, CartResolver, CartItemResolver],
	exports: [CartService],
})
export class CartModule {}
