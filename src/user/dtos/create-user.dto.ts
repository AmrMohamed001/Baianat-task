import { Field, InputType } from '@nestjs/graphql';
import {
	IsEmail,
	IsNumber,
	IsOptional,
	IsPhoneNumber,
	IsString,
	IsStrongPassword,
	Length,
	MinLength,
} from 'class-validator';
@InputType()
export class CreateUserDto {
	@IsString()
	@Length(5, 12)
	@Field()
	username: string;

	@IsString()
	@Length(2, 60)
	@Field()
	fullname: string;

	@IsEmail()
	@Field()
	email: string;

	@IsString()
	@MinLength(4)
	@Field()
	password: string;
	
	@IsPhoneNumber('EG')
	@IsOptional()
	@Field({ nullable: true })
	phone: string;

	@IsOptional()
	@Field({ nullable: true })
	image?: string;
}
