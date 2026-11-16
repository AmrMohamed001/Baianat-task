import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationArgs } from '../../common/query/types/pagination.args';

@ArgsType()
export class ProductsArgs extends PaginationArgs {
	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	vendorId?: number;
}
