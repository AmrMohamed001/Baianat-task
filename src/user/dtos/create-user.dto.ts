import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	IsString,
	Length,
	MinLength,
} from 'class-validator';

@InputType({ isAbstract: true })
export abstract class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	@Length(5, 12)
	@Field()
	username: string;

	@IsString()
	@IsNotEmpty()
	@Length(2, 60)
	@Field()
	fullname: string;

	@Transform(({ value }) => value?.trim().toLowerCase())
	@IsEmail()
	@Field()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@Field()
	password: string;

	@IsOptional()
	@Field({ nullable: true })
	phone?: string;
}
