import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { Review } from '../review/review.entity';

@Injectable({ scope: Scope.REQUEST })
export class ReviewLoader {
	constructor(@InjectRepository(Review) private repo: Repository<Review>) {}

	// vendor.reviews
	byVendorId = new DataLoader(async (vendorIds: readonly number[]) => {
		const reviews = await this.repo.find({ where: { vendorId: In([...vendorIds]) }, order: { createdAt: 'DESC', id: 'DESC' } });
		return vendorIds.map((id) => reviews.filter((r) => r.vendorId === id));
	});
}
