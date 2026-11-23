import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { WishlistItem } from './wishlist.entity';
import { Product } from '../product/product.entity';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { QueryService } from '../common/query/query.service';

@Injectable()
export class WishlistService {
	constructor(
		private readonly query: QueryService,
		@InjectRepository(WishlistItem) private readonly wishlistRepo: Repository<WishlistItem>,
		@InjectRepository(Product) private readonly productRepo: Repository<Product>,
		private readonly i18n: I18nService
	) {}

	async add(clientId: number, productId: number) {
		const product = await this.productRepo.findOne({ where: { id: productId } });
		if (!product) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT'));

		await this.wishlistRepo.upsert({ clientId, productId }, ['clientId', 'productId']);
		return product;
	}

	async remove(clientId: number, productId: number) {
		await this.wishlistRepo.delete({ clientId, productId });
		return true;
	}

	myWishlist(clientId: number, args: PaginationArgs) {
		const qb = this.productRepo 
			.createQueryBuilder('product')
			.innerJoin(WishlistItem, 'item', 'item.productId = product.id')
			.where('item.clientId = :clientId', { clientId })
			.orderBy('item.createdAt', 'DESC')
			.addOrderBy('item.id', 'DESC');
		return this.query.getPage(qb, args);
	}
}
