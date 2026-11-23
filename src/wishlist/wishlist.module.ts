import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistItem } from './wishlist.entity';
import { Product } from '../product/product.entity';
import { WishlistService } from './wishlist.service';
import { WishlistResolver } from './wishlist.resolver';

@Module({
	imports: [TypeOrmModule.forFeature([WishlistItem, Product])],
	providers: [WishlistService, WishlistResolver],
})
export class WishlistModule {}
