import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CartItem } from './cart-item.entity';
import { Product } from '../product/product.entity';
import { ProductLoader } from '../dataloader/product.loader';
import { VendorLoader } from '../dataloader/vendor.loader';
import { VendorStatus } from '../vendor/enums/vendor-status.enum';

@Resolver(() => CartItem)
export class CartItemResolver {
	constructor(
		private readonly productLoader: ProductLoader,
		private readonly vendorLoader: VendorLoader
	) {}

	@ResolveField(() => Product)
	product(@Parent() item: CartItem) {
		return this.productLoader.byId.load(item.productId); // withDeleted: soft-deleted products still show
	}

	@ResolveField(() => Boolean)
	async available(@Parent() item: CartItem) {
		const product = await this.productLoader.byId.load(item.productId);
		if (!product) return false;
		const vendor = await this.vendorLoader.byId.load(product.vendorId);
		return !product.deletedAt && vendor?.status === VendorStatus.Verified && !!vendor.owner.isActive && product.stock >= item.quantity;
	}
}
