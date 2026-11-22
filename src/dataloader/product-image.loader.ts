import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { ProductImage } from '../product/product-image.entity';
import { StorageService } from '../storage/storage.service';

@Injectable({ scope: Scope.REQUEST })
export class ProductImageLoader {
	constructor(
		@InjectRepository(ProductImage) private repo: Repository<ProductImage>,
		private storage: StorageService
	) {}

	// product.images
	byProductId = new DataLoader(async (productIds: readonly number[]) => {
		const images = await this.repo.find({ where: { productId: In([...productIds]) }, order: { id: 'ASC' } });
		return productIds.map((id) =>
			images.filter((i) => i.productId === id).map((i) => ({ id: i.id, url: this.storage.urlFor(i.key), createdAt: i.createdAt }))
		);
	});
}
