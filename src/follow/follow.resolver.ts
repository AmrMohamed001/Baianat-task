import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { FollowService } from './follow.service';
import { PaginatedFollowers } from './dtos/follower.type';
import { Vendor } from '../vendor/vendor.entity';
import { PaginatedPublicVendors, PublicVendor } from '../vendor/dtos/public-vendor.type';
import { VerifiedVendor } from '../vendor/decorators/verified-vendor.decorator';
import { CurrentVendor } from '../vendor/decorators/current-vendor.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';
@Resolver(() => PublicVendor)
export class FollowResolver {
	constructor(
		private readonly followService: FollowService,
		private readonly i18n: I18nService
	) {}

	@Roles(UserRole.Client)
	@Mutation(() => PublicVendor)
	followVendor(@Args('vendorId', { type: () => Int }) vendorId: number, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN')); // RolesGuard lets SuperAdmin through
		return this.followService.follow(user.id, vendorId);
	}

	@Roles(UserRole.Client)
	@Mutation(() => PublicVendor)
	unfollowVendor(@Args('vendorId', { type: () => Int }) vendorId: number, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.followService.unfollow(user.id, vendorId);
	}

	@Roles(UserRole.Client)
	@Query(() => PaginatedPublicVendors)
	myFollowings(@Args() args: PaginationArgs, @CurrentUser() user: User) {
		return this.followService.myFollowings(user.id, args);
	}

	@VerifiedVendor()
	@Query(() => PaginatedFollowers)
	myFollowers(@Args() args: PaginationArgs, @CurrentVendor() vendor: Vendor) {
		if (!vendor) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN')); // admin: no vendor
		return this.followService.myFollowers(vendor.id, args);
	}
}
