import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PublicVendor } from './dtos/public-vendor.type';
import { Product } from '../product/product.entity';
import { ProductLoader } from '../dataloader/product.loader';

@Resolver(() => PublicVendor)
export class PublicVendorResolver {
	constructor(private readonly productLoader: ProductLoader) {}

	@ResolveField(() => [Product])
	products(@Parent() vendor: PublicVendor) {
		return this.productLoader.byVendorId.load(vendor.id);
	}
}
