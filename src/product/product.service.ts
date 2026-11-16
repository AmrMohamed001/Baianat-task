import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { Vendor } from '../vendor/vendor.entity';
import { VendorStatus } from '../vendor/enums/vendor-status.enum';
import { CreateProductInput } from './dtos/create-product.dto';
import { UpdateProductInput } from './dtos/update-product.dto';
import { ProductsArgs } from './dtos/products.args';
import { ProductSortField } from './enums/product-sort.enum';
import { SortOrder } from '../common/query/enums/sort-order.enum';
import { paginate } from '../common/query/paginate';
import { fullTextSearch } from '../common/query/search';
import { sort } from '../common/query/sort';
import { VendorFollow } from '../follow/follow.entity';
@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(Product) private readonly productRepo: Repository<Product>,
		@InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
		@InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
		private readonly i18n: I18nService
	) {}

	async create(input: CreateProductInput, vendorId?: number) {
		if (vendorId === undefined) {
			if (!input.vendorId) throw new BadRequestException(this.i18n.t('exceptions.VENDOR_ID_REQUIRED'));
			const vendor = await this.vendorRepo.findOne({ where: { id: input.vendorId } });
			if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));
			if (vendor.status !== VendorStatus.Verified) throw new BadRequestException(this.i18n.t('exceptions.VENDOR_NOT_APPROVED'));
			vendorId = vendor.id;
		}

		const cat = await this.categoryRepo.findOne({ where: { id: input.categoryId } });
		if (!cat) throw new BadRequestException(this.i18n.t('exceptions.NOT_FOUND_CATEGORY'));
		return this.productRepo.save(this.productRepo.create({ ...input, vendorId }));
	}

	async update(id: number, input: UpdateProductInput, vendorId?: number) {
		if (Object.keys(input).length === 0)  throw new BadRequestException(this.i18n.t('exceptions.EMPTY_UPDATE'));
		const product = await this.productRepo.findOne({ where: { id } }); // skips soft-deleted
		if (!product) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT'));
		if (vendorId !== undefined && product.vendorId !== vendorId)
			throw new ForbiddenException(this.i18n.t('exceptions.NOT_OWNER'));

		if (input.categoryId !== undefined) {
			const cat = await this.categoryRepo.findOne({ where: { id: input.categoryId } });
			if (!cat) throw new BadRequestException(this.i18n.t('exceptions.NOT_FOUND_CATEGORY'));
		}

		return this.productRepo.save(this.productRepo.merge(product, input));
	}

	async delete(id: number, vendorId?: number) {
		const product = await this.productRepo.findOne({ where: { id } });
		if (!product) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT'));
		if (vendorId !== undefined && product.vendorId !== vendorId)
			throw new ForbiddenException(this.i18n.t('exceptions.NOT_OWNER'));

		await this.productRepo.softDelete(id);
		return true;
	}
	async findAll(args: ProductsArgs, vendorId?: number, clientId?: number) {
		const { search, categoryIds, minPrice, maxPrice, sortBy = ProductSortField.createdAt, order = SortOrder.DESC } = args;
		if (minPrice != null && maxPrice != null && minPrice > maxPrice) throw new BadRequestException(this.i18n.t('exceptions.MIN_PRICE_GT_MAX'));

		// only verified vendors whose owner is active
		const qb = this.productRepo
			.createQueryBuilder('product')
			.innerJoin('product.vendor', 'vendor')
			.innerJoin('vendor.owner', 'owner')
			.where('vendor.status = :status', { status: VendorStatus.Verified })
			.andWhere('owner.isActive = true');

		// filtering
		if (clientId) qb.leftJoin(VendorFollow, 'follow', 'follow.vendorId = product.vendorId AND follow.clientId = :clientId', { clientId }).orderBy('follow.id', 'DESC', 'NULLS LAST');
		if (vendorId) qb.andWhere('product.vendorId = :vendorId', { vendorId });
		if (categoryIds?.length) qb.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds });
		if (minPrice != null) qb.andWhere('product.price >= :minPrice', { minPrice });
		if (maxPrice != null) qb.andWhere('product.price <= :maxPrice', { maxPrice });

		if (search) fullTextSearch(qb, search);
		sort(qb, sortBy, order);
		return paginate(qb, args);
	}

	findAvailable(id: number) {
		return this.productRepo
			.createQueryBuilder('product')
			.innerJoin('product.vendor', 'vendor')
			.innerJoin('vendor.owner', 'owner')
			.where('product.id = :id', { id })
			.andWhere('vendor.status = :status', { status: VendorStatus.Verified })
			.andWhere('owner.isActive = true')
			.getOne();
	}
}
