import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@ArgsType()
export class AddToCartArgs {
	@IsInt()
	@Field(() => Int)
	productId: number;

	@IsInt()
	@Min(1)
	@Max(99)
	@Field(() => Int)
	quantity: number;
}

@ArgsType()
export class UpdateCartItemArgs {
	@IsInt()
	@Field(() => Int)
	productId: number;

	@IsInt()
	@Min(0)
	@Max(99)
	@Field(() => Int, { description: '0 removes the item from the cart' })
	quantity: number;
}
