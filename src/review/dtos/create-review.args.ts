import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

@ArgsType()
export class CreateReviewArgs {
	@IsInt()
	@Field(() => Int)
	vendorId: number;

	@IsInt()
	@Min(1)
	@Max(5)
	@Field(() => Int)
	rating: number;

	@Transform(({ value }) => value?.trim())
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	@Field(() => String, { nullable: true })
	comment?: string;
}
