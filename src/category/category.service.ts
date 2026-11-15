import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryInput } from './dtos/create-category.dto';
import { UpdateCategoryInput } from './dtos/update-category.dto';

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
		private readonly i18n: I18nService
	) {}

	async findAll() {
		const categories = await this.categoryRepo.find({ order: { id: 'ASC' } });
		const isEn = I18nContext.current()?.lang === 'en';
		return categories.map((c) => ({ id: c.id, name: isEn ? c.nameEn : c.nameAr }));
	}

	create(input: CreateCategoryInput) {
		return this.categoryRepo.save(this.categoryRepo.create(input)); // duplicate name -> 23505 -> DUPLICATE_FIELD
	}

	async update(id: number, input: UpdateCategoryInput) {
		const category = await this.findById(id);
		return this.categoryRepo.save(this.categoryRepo.merge(category, input)); // merge skips the undefined (not sent) name
	}

	async delete(id: number) {
		const category = await this.findById(id);
		await this.categoryRepo.remove(category);
		return true;
	}

	private async findById(id: number) {
		const category = await this.categoryRepo.findOne({ where: { id } });
		if (!category) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_CATEGORY'));
		return category;
	}
}
