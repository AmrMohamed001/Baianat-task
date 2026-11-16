import { Int, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';

@Resolver(() => CartItem)
export class CartItemResolver {
	constructor(private readonly cartService: CartService) {}

	@ResolveField(() => Boolean)
	available(@Parent() item: CartItem) {
		return this.cartService.isAvailable(item);
	}

	@ResolveField(() => Int) // cents
	unitPrice(@Parent() item: CartItem) {
		return item.product.price;
	}

	@ResolveField(() => Int) // cents
	lineTotal(@Parent() item: CartItem) {
		return item.product.price * item.quantity;
	}
}
