import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';

@ObjectType()
export class Follower {
	@Field(() => Int)
	id: number;

	@Field()
	name: string;

	@Field()
	followedAt: Date;
}

@ObjectType() export class PaginatedFollowers extends Paginated(Follower) {}
