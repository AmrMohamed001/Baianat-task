import { ArgsType, Field, Float, Int } from '@nestjs/graphql';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

@ArgsType()
export class SetVendorCommissionArgs {
	@IsInt()
	@Field(() => Int)
	vendorId: number;

	//numeric(5,2)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	@Max(100)
	@Field(() => Float)
	commissionRate: number;
}
