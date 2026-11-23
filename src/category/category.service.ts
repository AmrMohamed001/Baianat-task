import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Product } from '../product/product.entity';
import { CreateCategoryInput } from './dtos/create-category.dto';
import { UpdateCategoryInput } from './dtos/update-category.dto';

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
		@InjectRepository(Product) private readonly productRepo: Repository<Product>,
		private readonly i18n: I18nService
	) {}

	findAll() {
		return this.categoryRepo.find({ order: { id: 'ASC' } });
	}

	create(input: CreateCategoryInput) {
		return this.categoryRepo.save(this.categoryRepo.create(input));
	}

	async update(id: number, input: UpdateCategoryInput) {
		const category = await this.findById(id);
		return this.categoryRepo.save(this.categoryRepo.merge(category, input)); 
	}

	async delete(id: number) {
		const category = await this.findById(id);
		if (await this.productRepo.exists({ where: { categoryId: id } }))
			throw new BadRequestException(this.i18n.t('exceptions.CATEGORY_HAS_PRODUCTS'));
		await this.categoryRepo.remove(category);
		return true;
	}

	private async findById(id: number) {
		const category = await this.categoryRepo.findOne({ where: { id } });
		if (!category) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_CATEGORY'));
		return category;
	}
}
