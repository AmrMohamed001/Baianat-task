import { IsInt } from 'class-validator';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { PaginationArgs } from '../../common/query/types/pagination.args';

@ArgsType()
export class VendorReviewsArgs extends PaginationArgs {
	@IsInt()
	@Field(() => Int)
	vendorId: number;
}
