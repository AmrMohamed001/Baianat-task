import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

export function Paginated<T>(ItemType: Type<T>) {
	@ObjectType({ isAbstract: true })
	class PaginatedType{
		@Field(() => [ItemType])
		data: T[];

		@Field(() => Int)
		total: number;

		@Field(() => Int)
		page: number;

		@Field(() => Int)
		limit: number;

		@Field(() => Int)
		totalPages: number;
	}
	return PaginatedType;
}
