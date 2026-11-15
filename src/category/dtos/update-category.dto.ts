import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class UpdateCategoryInput {
	@Transform(({ value }) => value?.trim())
	@IsOptional()
	@IsString()
	@Length(2, 50)
	@Field({ nullable: true })
	nameAr?: string;

	@Transform(({ value }) => value?.trim())
	@IsOptional()
	@IsString()
	@Length(2, 50)
	@Field({ nullable: true })
	nameEn?: string;
}
