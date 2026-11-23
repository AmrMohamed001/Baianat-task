import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';

@ObjectType()
export class PublicVendor {
	@Field(() => Int)
	id: number;

	@Field()
	storeName: string;

	@Field(() => String, { nullable: true })
	description: string | null;

	@Field(() => Float, { nullable: true })
	averageRating: number | null;

	@Field(() => Int)
	reviewsCount: number;

	@Field(() => Int)
	followersCount: number;
}

@ObjectType() export class PaginatedPublicVendors extends Paginated(PublicVendor) {}
