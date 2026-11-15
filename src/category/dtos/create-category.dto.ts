import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

@InputType()
export class CreateCategoryInput {
	@Transform(({ value }) => value?.trim())
	@IsString()
	@Length(2, 50)
	@Field()
	nameAr: string;

	@Transform(({ value }) => value?.trim())
	@IsString()
	@Length(2, 50)
	@Field()
	nameEn: string;
}
