import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { PublicCategory } from './dtos/public-category.type';
import { CreateCategoryInput } from './dtos/create-category.dto';
import { UpdateCategoryInput } from './dtos/update-category.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Resolver()
export class CategoryResolver {
	constructor(private readonly categoryService: CategoryService) {}

	@Public()
	@Query(() => [PublicCategory])
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
}
