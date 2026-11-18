import { ArgsType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@ArgsType()
export class CheckoutArgs {
	@Transform(({ value }) => value?.trim())
	@IsString()
	@IsNotEmpty()
	@Length(5, 500)
	@Field()
	shippingAddress: string;
}
