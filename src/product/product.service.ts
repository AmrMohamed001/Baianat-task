import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { CreateProductInput } from './dtos/create-product.dto';
import { UpdateProductInput } from './dtos/update-product.dto';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { paginate } from '../common/query/paginate';

@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(Product) private readonly productRepo: Repository<Product>,
		@InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
		private readonly i18n: I18nService
	) {}

	async create(vendorId: number, input: CreateProductInput) {
		const cat = await this.categoryRepo.findOne({ where: { id: input.categoryId } });
		if (!cat) throw new BadRequestException(this.i18n.t('exceptions.NOT_FOUND_CATEGORY'));
		return this.productRepo.save(this.productRepo.create({ ...input, vendorId }));
	}

	async update(vendorId: number, id: number, input: UpdateProductInput) {
		if (Object.keys(input).length === 0)  throw new BadRequestException(this.i18n.t('exceptions.EMPTY_UPDATE'));
		const product = await this.productRepo.findOne({ where: { id } }); // skips soft-deleted
		if (!product) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT'));
		if (product.vendorId !== vendorId) throw new ForbiddenException(this.i18n.t('exceptions.NOT_OWNER'));

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

	myProducts(vendorId: number, args: PaginationArgs) {
		const qb = this.productRepo
			.createQueryBuilder('p')
			.where('p.vendorId = :vendorId', { vendorId })
			.orderBy('p.createdAt', 'DESC')
			.addOrderBy('p.id', 'DESC');
		return paginate(qb, args);
	}
}
