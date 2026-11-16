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
import { VendorStatus } from '../vendor/enums/vendor-status.enum';

// clients only: RolesGuard lets SuperAdmin through, so each route also checks the role
@Resolver(() => CartItem)
export class CartResolver {
	constructor(
		private readonly cartService: CartService,
		private readonly i18n: I18nService
	) {}

	@Roles(UserRole.Client)
	@Query(() => Cart)
	myCart(@CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.cartService.myCart(user.id);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Cart)
	addToCart(@Args() { productId, quantity }: AddToCartArgs, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.cartService.add(user.id, productId, quantity);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Cart)
	updateCartItem(@Args() { productId, quantity }: UpdateCartItemArgs, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.cartService.update(user.id, productId, quantity);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Cart)
	removeFromCart(@Args('productId', { type: () => Int }) productId: number, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.cartService.remove(user.id, productId);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Cart)
	clearCart(@CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.cartService.clear(user.id);
	}

	@ResolveField(() => Boolean)
	available(@Parent() item: CartItem) {
		const { product } = item;
		return !product.deletedAt && product.vendor.status === VendorStatus.Verified && product.vendor.owner.isActive && product.stock >= item.quantity;
	}
}
