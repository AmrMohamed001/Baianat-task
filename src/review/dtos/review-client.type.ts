import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReviewClient {
	@Field(() => Int)
	id: number;

	@Field()
	fullname: string;

	@Field(() => String, { nullable: true })
	image: string | null;
}
