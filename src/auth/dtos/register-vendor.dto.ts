import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { CreateUserDto } from '../../user/dtos/create-user.dto';

@InputType()
export class RegisterVendorInput extends CreateUserDto {
	@Transform(({ value }) => value.trim())
	@IsString()
	@IsNotEmpty()
	@Length(3, 60)
	@Field()
	storeName: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	@Field({ nullable: true })
	description?: string;
}
