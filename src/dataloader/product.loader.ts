import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { Product } from '../product/product.entity';
import { VendorStatus } from '../vendor/enums/vendor-status.enum';

@Injectable({ scope: Scope.REQUEST })
export class ProductLoader {
	constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

	// cartItem.product
	byId = new DataLoader(async (ids: readonly number[]) => {
		const products = await this.repo.find({ where: { id: In([...ids]) }, withDeleted: true });
		return ids.map((id) => products.find((p) => p.id === id) ?? null);
	});

	// vendor.products 
	byVendorId = new DataLoader(async (vendorIds: readonly number[]) => {
		const products = await this.repo.find({
			where: { vendorId: In([...vendorIds]), vendor: 
				{ status: VendorStatus.Verified, owner: { isActive: true } } },
			order: { createdAt: 'DESC', id: 'DESC' },
		});
		return vendorIds.map((id) => products.filter((p) => p.vendorId === id));
	});

	// category.products
	byCategoryId = new DataLoader(async (categoryIds: readonly number[]) => {
		const products = await this.repo.find({
			where: { categoryId: In([...categoryIds]), vendor: 
				{ status: VendorStatus.Verified, owner: { isActive: true } } },
			order: { createdAt: 'DESC', id: 'DESC' },
		});
		return categoryIds.map((id) => products.filter((p) => p.categoryId === id));
	});
}
