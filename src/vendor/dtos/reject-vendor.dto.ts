import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class RejectVendorInput {
	@Transform(({ value }) => value?.trim())
	@IsOptional()
	@IsString()
	@MaxLength(500)
	@Field({ nullable: true })
	reason?: string;
}
