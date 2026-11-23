import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { AddToCartArgs, UpdateCartItemArgs } from './dtos/cart-item.args';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';
import { CartItemLoader } from '../dataloader/cart-item.loader';

@Resolver(() => Cart)
export class CartResolver {
	constructor(
		private readonly cartService: CartService,
		private readonly cartItemLoader: CartItemLoader,
	) {}

	@Roles(UserRole.Client)
	@Query(() => Cart)
	myCart(@CurrentUser() user: User) {
		return this.cartService.myCart(user.id);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Cart)
	addToCart(@Args() { productId, quantity }: AddToCartArgs, @CurrentUser() user: User) {
		return this.cartService.add(user.id, productId, quantity);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Cart)
	updateCartItem(@Args() { productId, quantity }: UpdateCartItemArgs, @CurrentUser() user: User) {
		return this.cartService.update(user.id, productId, quantity);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Cart)
	removeFromCart(@Args('productId', { type: () => Int }) productId: number, @CurrentUser() user: User) {
		return this.cartService.remove(user.id, productId);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Cart)
	clearCart(@CurrentUser() user: User) {
		return this.cartService.clear(user.id);
	}

	@ResolveField(() => [CartItem])
	items(@Parent() cart: Cart) {
		return this.cartItemLoader.byCartId.load(cart.id);
	}

	@ResolveField(() => Int) // cents
	async total(@Parent() cart: Cart) {
		return this.cartService.total(await this.cartItemLoader.byCartId.load(cart.id));
	}
}
