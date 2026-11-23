import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PaginatedResult } from '../interfaces/pagination.interface';

export function Paginated<T>(ItemType: Type<T>) {
	@ObjectType({ isAbstract: true })
	class PaginatedType implements PaginatedResult<T> {
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
