import { Field, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateProductInput {
	@Transform(({ value }) => value?.trim())
	@IsString()
	@Length(2, 120)
	@Field()
	nameAr: string;

	@Transform(({ value }) => value?.trim())
	@IsString()
	@Length(2, 120)
	@Field()
	nameEn: string;

	@Transform(({ value }) => value?.trim())
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	@Field({ nullable: true })
	descriptionAr?: string;

	@Transform(({ value }) => value?.trim())
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	@Field({ nullable: true })
	descriptionEn?: string;

	@IsInt()
	@Min(1)
	@Field(() => Int, { description: 'cents' })
	price: number;

	@IsInt()
	@Min(0)
	@Field(() => Int)
	stock: number;

	@IsInt()
	@Field(() => Int)
	categoryId: number;
}
