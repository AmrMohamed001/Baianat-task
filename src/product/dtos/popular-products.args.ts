import { ArgsType, Field } from '@nestjs/graphql';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationArgs } from '../../common/query/types/pagination.args';

@ArgsType()
export class PopularProductsArgs extends PaginationArgs {
	@IsOptional()
	@IsDate()
	@Field(() => Date, { nullable: true })
	from?: Date;

	@IsOptional()
	@IsDate()
	@Field(() => Date, { nullable: true })
	to?: Date;
}
