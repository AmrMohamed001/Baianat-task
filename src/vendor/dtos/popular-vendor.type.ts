import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';
import { PublicVendor } from './public-vendor.type';

@ObjectType()
export class PopularVendor {
	@Field(() => PublicVendor)
	vendor: PublicVendor;

	@Field(() => Int)
	salesCount: number;

	@Field(() => Float)
	score: number;
}

@ObjectType()
export class PaginatedPopularVendors extends Paginated(PopularVendor) {}
