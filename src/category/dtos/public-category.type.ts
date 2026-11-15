import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicCategory {
	@Field(() => Int)
	id: number;

	@Field()
	name: string;
}
