import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Product } from '../product/product.entity';
import { ProductLoader } from '../dataloader/product.loader';
import { I18nContext } from 'nestjs-i18n';
import { Category } from './category.entity';
import { CreateCategoryInput } from './dtos/create-category.dto';
import { UpdateCategoryInput } from './dtos/update-category.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Resolver(() => Category)
export class CategoryResolver {
	constructor(
		private readonly categoryService: CategoryService,
		private readonly productLoader: ProductLoader
	) {}

	@Public()
	@Query(() => [Category])
	categories() {
		return this.categoryService.findAll();
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Category)
	createCategory(@Args('input') input: CreateCategoryInput) {
		return this.categoryService.create(input);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Category)
	updateCategory(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateCategoryInput) {
		return this.categoryService.update(id, input);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Boolean)
	deleteCategory(@Args('id', { type: () => Int }) id: number) {
		return this.categoryService.delete(id);
	}

	@ResolveField(() => String)
	name(@Parent() category: Category) {
		return I18nContext.current()?.lang === 'en' ? category.nameEn : category.nameAr;
	}

	@ResolveField(() => [Product])
	products(@Parent() category: Category) {
		return this.productLoader.byCategoryId.load(category.id);
	}
}
