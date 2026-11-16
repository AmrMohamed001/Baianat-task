import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { ProductModule } from '../product/product.module';

@Module({
	imports: [TypeOrmModule.forFeature([Cart, CartItem]), ProductModule],
	providers: [CartService, CartResolver],
	exports: [CartService],
})
export class CartModule {}
