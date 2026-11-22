import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { Vendor } from '../vendor/vendor.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { ProductImage } from './product-image.entity';
import { StorageModule } from '../storage/storage.module';
import { DataloaderModule } from '../dataloader/dataloader.module';

@Module({
	imports: [TypeOrmModule.forFeature([Product, Category, Vendor, ProductImage]), DataloaderModule, StorageModule],
	providers: [ProductService, ProductResolver],
	exports: [ProductService],
})
export class ProductModule {}
