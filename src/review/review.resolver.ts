import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { Review } from './review.entity';
import { ReviewService } from './review.service';
import { CreateReviewArgs } from './dtos/create-review.args';
import { UpdateReviewArgs } from './dtos/update-review.args';
import { VendorReviewsArgs } from './dtos/vendor-reviews.args';
import { PaginatedReviews } from './dtos/paginated-reviews.type';
import { ReviewClient } from './dtos/review-client.type';
import { PublicVendor } from '../vendor/dtos/public-vendor.type';
import { UserLoader } from '../dataloader/user.loader';
import { VendorLoader } from '../dataloader/vendor.loader';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';

@Resolver(() => Review)
export class ReviewResolver {
	constructor(
		private readonly reviewService: ReviewService,
		private readonly userLoader: UserLoader,
		private readonly vendorLoader: VendorLoader,
		private readonly i18n: I18nService
	) {}

	@Roles(UserRole.Client)
	@Mutation(() => Review)
	createReview(@Args() args: CreateReviewArgs, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.reviewService.create(user.id, args);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Review)
	updateReview(@Args() args: UpdateReviewArgs, @CurrentUser() user: User) {
		return this.reviewService.update(user.id, args);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Boolean)
	deleteReview(@Args('reviewId', { type: () => Int }) reviewId: number, @CurrentUser() user: User) {
		return this.reviewService.delete(user.id, reviewId);
	}

	@Public()
	@Query(() => PaginatedReviews)
	vendorReviews(@Args() args: VendorReviewsArgs) {
		return this.reviewService.getReviews(args);
	}

	@ResolveField(() => ReviewClient, { nullable: true })
	client(@Parent() review: Review) {
		return this.userLoader.byId.load(review.clientId);
	}

	@ResolveField(() => PublicVendor, { nullable: true })
	vendor(@Parent() review: Review) {
		return this.vendorLoader.byId.load(review.vendorId);
	}
}
