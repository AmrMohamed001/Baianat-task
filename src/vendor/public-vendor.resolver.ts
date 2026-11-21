import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PublicVendor } from './dtos/public-vendor.type';
import { Product } from '../product/product.entity';
import { ProductLoader } from '../dataloader/product.loader';
import { Review } from '../review/review.entity';
import { ReviewLoader } from '../dataloader/review.loader';

@Resolver(() => PublicVendor)
export class PublicVendorResolver {
	constructor(
		private readonly productLoader: ProductLoader,
		private readonly reviewLoader: ReviewLoader
	) {}

	@ResolveField(() => [Product])
	products(@Parent() vendor: PublicVendor) {
		return this.productLoader.byVendorId.load(vendor.id);
	}

	@ResolveField(() => [Review])
	reviews(@Parent() vendor: PublicVendor) {
		return this.reviewLoader.byVendorId.load(vendor.id);
	}
}
