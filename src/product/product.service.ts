import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { QueryService } from '../common/query/query.service';
import { VendorFollow } from '../follow/follow.entity';
import { ProductImage } from './product-image.entity';
import { StorageService } from '../storage/storage.service';
import { uploadProfiles } from '../storage/upload-profiles';
import { ImageContentType } from '../storage/enums/image-content-type.enum';
import { PopularProductsArgs } from './dtos/popular-products.args';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { OrderStatus } from '../order/enums/order-status.enum';
import { PaymentStatus } from '../order/enums/payment-status.enum';

@Injectable()
export class ProductService {
	constructor(
		private readonly query: QueryService,
		@InjectRepository(Product) private readonly productRepo: Repository<Product>,
		@InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
		@InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
		@InjectRepository(ProductImage) private readonly imageRepo: Repository<ProductImage>,
		private readonly storage: StorageService,
		private readonly logger: Logger,
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

	async popularProducts({ from, to, page, limit }: PopularProductsArgs) {
		if (from && to && from > to) throw new BadRequestException(this.i18n.t('exceptions.DATE_FROM_AFTER_TO'));

		const qb = this.productRepo
			.createQueryBuilder('product')
			.innerJoin(OrderItem, 'item', 'item.productId = product.id')
			.innerJoin(Order, 'order', 'order.id = item.orderId')
			.where('order.paymentStatus = :paid', { paid: PaymentStatus.Paid })
			.andWhere('order.status != :cancelled', { cancelled: OrderStatus.Cancelled })
			.addSelect('SUM(item.quantity)', 'totalQuantity')
			.groupBy('product.id')
			.orderBy('"totalQuantity"', 'DESC')
			.addOrderBy('MAX(order.createdAt)', 'DESC')
			.addOrderBy('product.id', 'ASC');
		if (from) qb.andWhere('order.createdAt >= :from', { from });
		if (to) qb.andWhere('order.createdAt <= :to', { to });
		this.query.paginate(qb, { page, limit });

		const { entities, raw } = await qb.getRawAndEntities();
		const total = await qb.getCount();
		return {
			data: entities.map((product, i) => ({ product, totalQuantity: Number(raw[i].totalQuantity) })),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async delete(id: number, vendorId?: number) {
		const product = await this.productRepo.findOne({ where: { id } });
		if (!product) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT'));
		if (vendorId !== undefined && product.vendorId !== vendorId)
			throw new ForbiddenException(this.i18n.t('exceptions.NOT_OWNER'));

		await this.productRepo.softDelete(id);
		return true;
	}
	//#region Images
	private async ownership(id: number, vendorId: number | undefined) {
		const product = await this.productRepo.findOne({ where: { id } });
		if (!product) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT'));
		if (vendorId !== undefined && product.vendorId !== vendorId) 
			throw new ForbiddenException(this.i18n.t('exceptions.NOT_OWNER'));
		return product
	}

	async createImageUpload(productId: number, contentType: ImageContentType, vendorId?: number) {
		await this.ownership(productId, vendorId);
		return this.storage.createPresignedUpload(uploadProfiles.productImage, productId, contentType);
	}

	async addImages(productId: number, keys: string[], vendorId?: number) {
		// check ownership
		const product = await this.ownership(productId, vendorId);

		// verify keys
		await Promise.all(keys.map((key) => this.storage.verifyUpload(uploadProfiles.productImage, productId, key)));

		// check if key exists before
		if (await this.imageRepo.exists({ where: keys.map((key) => ({ key })) }))
			throw new BadRequestException(this.i18n.t('exceptions.INVALID_UPLOAD_KEY'));

		// save the keys
		await this.imageRepo.save(keys.map((key) => this.imageRepo.create({ productId, key })));


		return product;
	}

	async removeImage(productId: number, imageId: number, vendorId?: number) {
		const product = await this.ownership(productId, vendorId);
		const image = await this.imageRepo.findOne({ where: { id: imageId, productId } });
		if (!image) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT_IMAGE'));

		await this.imageRepo.delete(image.id);
		this.storage.deleteObject(image.key).catch((e) => this.logger.error(e.message, e.stack));
		return product;
	}
	//#endregion
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
		if (clientId) qb.leftJoin(VendorFollow, 'follow', 'follow.vendorId = product.vendorId AND follow.clientId = :clientId', { clientId }).orderBy('(follow.id IS NOT NULL)', 'DESC');
		if (vendorId) qb.andWhere('product.vendorId = :vendorId', { vendorId });
		if (categoryIds?.length) qb.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds });
		if (minPrice != null) qb.andWhere('product.price >= :minPrice', { minPrice });
		if (maxPrice != null) qb.andWhere('product.price <= :maxPrice', { maxPrice });

		if (search) this.query.search(qb, search);
		this.query.sort(qb, sortBy, order);
		return this.query.getPage(qb, args);
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
