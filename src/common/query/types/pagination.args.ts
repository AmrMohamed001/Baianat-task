import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
	@Min(1)
	@Field(() => Int, { defaultValue: 1 })
	page: number = 1;

	@Min(1)
	@Max(50)
	@Field(() => Int, { defaultValue: 20 })
	limit: number = 20;
}
