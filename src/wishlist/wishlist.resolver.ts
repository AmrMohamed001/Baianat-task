import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WishlistService } from './wishlist.service';
import { Product } from '../product/product.entity';
import { PaginatedProducts } from '../product/dtos/paginated-products.type';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';

@Resolver()
export class WishlistResolver {
	constructor(
		private readonly wishlistService: WishlistService,
	) {}

	@Roles(UserRole.Client)
	@Mutation(() => Product)
	addToWishlist(@Args('productId', { type: () => Int }) productId: number, @CurrentUser() user: User) {
		return this.wishlistService.add(user.id, productId);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Boolean)
	removeFromWishlist(@Args('productId', { type: () => Int }) productId: number, @CurrentUser() user: User) {
		return this.wishlistService.remove(user.id, productId);
	}

	@Roles(UserRole.Client)
	@Query(() => PaginatedProducts)
	myWishlist(@Args() args: PaginationArgs, @CurrentUser() user: User) {
		return this.wishlistService.myWishlist(user.id, args);
	}
}
