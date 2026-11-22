import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class PresignedUpload {
	@Field()
	url: string;

	@Field(() => GraphQLJSON)
	fields: Record<string, string>;

	@Field()
	key: string;

	@Field()
	expiresAt: Date;
}
