import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { Vendor } from '../vendor/vendor.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { DataloaderModule } from '../dataloader/dataloader.module';

@Module({
	imports: [TypeOrmModule.forFeature([Product, Category, Vendor]), DataloaderModule],
	providers: [ProductService, ProductResolver],
	exports: [ProductService],
})
export class ProductModule {}
