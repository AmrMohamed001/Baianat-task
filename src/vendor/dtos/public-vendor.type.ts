import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';

@ObjectType()
export class PublicVendor {
	@Field(() => Int)
	id: number;

	@Field()
	storeName: string;

	@Field(() => String, { nullable: true })
	description: string | null;
}

@ObjectType() export class PaginatedPublicVendors extends Paginated(PublicVendor) {}
