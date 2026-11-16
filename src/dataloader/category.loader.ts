import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { Category } from '../category/category.entity';

@Injectable({ scope: Scope.REQUEST })
export class CategoryLoader {
	constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

	//product.category
	byId = new DataLoader(async (ids: readonly number[]) => {
		const categories = await this.repo.findBy({ id: In([...ids]) });
		return ids.map((id) => categories.find((c) => c.id === id) ?? null);
	});
}
