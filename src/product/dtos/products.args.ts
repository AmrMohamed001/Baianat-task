import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationArgs } from '../../common/query/types/pagination.args';
import { ProductSortField } from '../enums/product-sort.enum';
import { SortOrder } from '../../common/query/enums/sort-order.enum';

@ArgsType()
export class ProductsArgs extends PaginationArgs {
	@Transform(({ value }) => value?.trim())
	@IsOptional()
	@IsString()
	@MaxLength(100)
	@Field({ nullable: true })
	search?: string;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	vendorId?: number;

	@IsOptional()
	@IsInt({ each: true })
	@Field(() => [Int], { nullable: true })
	categoryIds?: number[];

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true, description: 'cents' })
	minPrice?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true, description: 'cents' })
	maxPrice?: number;

	@IsOptional()
	@IsEnum(ProductSortField)
	@Field(() => ProductSortField, { defaultValue: ProductSortField.createdAt })
	sortBy?: ProductSortField;

	@IsOptional()
	@IsEnum(SortOrder)
	@Field(() => SortOrder, { defaultValue: SortOrder.DESC })
	order?: SortOrder;
}
