import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@ArgsType()
export class PayoutVendorArgs {
	@IsInt()
	@Field(() => Int)
	vendorId: number;

	@IsInt()
	@Min(1)
	@Field(() => Int)
	amount: number;
}
