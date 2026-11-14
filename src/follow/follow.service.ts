import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { VendorFollow } from './follow.entity';
import { Vendor } from '../vendor/vendor.entity';
import { VendorStatus } from '../vendor/enums/vendor-status.enum';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { paginate } from '../common/query/paginate';

@Injectable()
export class FollowService {
	constructor(
		@InjectRepository(VendorFollow) private readonly followRepo: Repository<VendorFollow>,
		@InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
		private readonly i18n: I18nService
	) {}

	async follow(clientId: number, vendorId: number) {
		const vendor = await this.vendorRepo.findOne({ where: { id: vendorId, status: VendorStatus.Verified } });
		if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));
		//todo: compare this way with the exception 23505 
		await this.followRepo.createQueryBuilder().insert().values({ clientId, vendorId }).orIgnore().execute(); //ignoring the conflicts
		return vendor;
	}

	async unfollow(clientId: number, vendorId: number) {
		const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } });
		if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));

		await this.followRepo.delete({ clientId, vendorId });
		return vendor;
	}

	followersCount(vendorId: number) {
		// i know that solution will be slow with large dataset but large here means in millions)and the workaround is by using stored count key with db trigger, but for now this is enough
		return this.followRepo.count({ where: { vendorId } });
	}

	async myFollowings(clientId: number, args: PaginationArgs) {
		const qb = this.followRepo
			.createQueryBuilder('f')
			.innerJoinAndSelect('f.vendor', 'v')
			.where('f.clientId = :clientId', { clientId })
			.orderBy('f.createdAt', 'DESC')
			.addOrderBy('f.id', 'DESC');
		const page = await paginate(qb, args);

		return { ...page, data: page.data.map((f) => f.vendor) };
	}

	async myFollowers(vendorId: number, args: PaginationArgs) {
		if (!vendorId) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		const qb = this.followRepo
			.createQueryBuilder('f')
			.innerJoin('f.client', 'u')
			.addSelect(['u.id', 'u.fullname'])
			.where('f.vendorId = :vendorId', { vendorId })
			.orderBy('f.createdAt', 'DESC')
			.addOrderBy('f.id', 'DESC');
		const page = await paginate(qb, args);

		return { ...page, data: page.data.map((f) => ({ id: f.client.id, name: f.client.fullname, followedAt: f.createdAt })) };
	}
}
