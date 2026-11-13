import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdatePasswordDto {
	@IsNotEmpty()
	@IsString()
	@Field()
	password: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@Field()
	newPassword: string;
}
