import { Field, ObjectType } from '@nestjs/graphql';
import { Checkout } from '../entities/checkout.entity';

@ObjectType()
export class CheckoutResult extends Checkout {
	@Field()
	clientSecret: string;
}
