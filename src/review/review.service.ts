import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import {Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewArgs } from './dtos/create-review.args';
import { UpdateReviewArgs } from './dtos/update-review.args';
import { VendorReviewsArgs } from './dtos/vendor-reviews.args';
import { Order } from '../order/entities/order.entity';
import { OrderStatus } from '../order/enums/order-status.enum';
import { PaymentStatus } from '../order/enums/payment-status.enum';
import { Vendor } from '../vendor/vendor.entity';
import { VendorStatus } from '../vendor/enums/vendor-status.enum';
import { paginate } from '../common/query/paginate';

@Injectable()
export class ReviewService {
	constructor(
		@InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
		@InjectRepository(Order) private readonly orderRepo: Repository<Order>,
		@InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
		private readonly i18n: I18nService
	) {}

	private async ownership(reviewId: number, clientId: number) {
		const review = await this.reviewRepo.findOneBy({ id: reviewId });
		if (!review) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_REVIEW'));
		if (review.clientId !== clientId) throw new ForbiddenException(this.i18n.t('exceptions.NOT_OWNER'));
		return review;
	}

	private async refreshStats(vendorId: number) {
		const { cnt, avg } = await this.reviewRepo
			.createQueryBuilder('r')
			.select('COUNT(*)', 'cnt')
			.addSelect('AVG(r.rating)', 'avg')
			.where('r.vendorId = :vendorId', { vendorId })
			.getRawOne();

		await this.vendorRepo.update(vendorId, {
			reviewsCount: Number(cnt),
			averageRating: avg ? Math.round(Number(avg) * 10) / 10 : null,
		});
	}

	async create(clientId: number, { vendorId, rating, comment }: CreateReviewArgs) {
		const vendor = await this.vendorRepo.findOneBy({ id: vendorId, status: VendorStatus.Verified });
		if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));

			// delivered paid
		const bought = await this.orderRepo.existsBy({ clientId, vendorId, status: OrderStatus.Delivered, paymentStatus: PaymentStatus.Paid });
		if (!bought) throw new ForbiddenException(this.i18n.t('exceptions.REVIEW_NOT_PURCHASED'));

		if (await this.reviewRepo.existsBy({ clientId, vendorId }))
			throw new ConflictException(this.i18n.t('exceptions.REVIEW_ALREADY_EXISTS'));

		const row = this.reviewRepo.create({ clientId, vendorId, rating, comment });
		const review = await this.reviewRepo.save(row);
		await this.refreshStats(vendorId);
		return review;
	}

	async update(clientId: number, { reviewId, rating, comment }: UpdateReviewArgs) {
		const review = await this.ownership(reviewId, clientId);
		if (rating !== undefined) review.rating = rating;
		if (comment !== undefined) review.comment = comment;
		const saved = await this.reviewRepo.save(review);
		await this.refreshStats(review.vendorId);
		return saved;
	}

	async delete(clientId: number, reviewId: number) {
			const review = await this.ownership(reviewId, clientId);
			await this.reviewRepo.remove(review);
			await this.refreshStats(review.vendorId);
			return true;
	}

	async getReviews({ vendorId, ...args }: VendorReviewsArgs) {
		const vendor = await this.vendorRepo.findOneBy({ id: vendorId, status: VendorStatus.Verified });
		if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));

		const qb = this.reviewRepo
			.createQueryBuilder('r')
			.where('r.vendorId = :vendorId', { vendorId })
			.orderBy('r.createdAt', 'DESC')
			.addOrderBy('r.id', 'DESC');
		return paginate(qb, args);
	}

	
}
