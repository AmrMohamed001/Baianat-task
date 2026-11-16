import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { CreateProductInput } from './dtos/create-product.dto';
import { UpdateProductInput } from './dtos/update-product.dto';
import { PaginatedProducts } from './dtos/paginated-products.type';
import { ProductsArgs } from './dtos/products.args';
import { Vendor } from '../vendor/vendor.entity';
import { VerifiedVendor } from '../vendor/decorators/verified-vendor.decorator';
import { CurrentVendor } from '../vendor/decorators/current-vendor.decorator';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { UserRole } from '../user/enums/user-role.enum';

@Resolver(() => Product)
export class ProductResolver {
	constructor(
		private readonly productService: ProductService,
		private readonly i18n: I18nService
	) {}

	@VerifiedVendor()
	@Mutation(() => Product)
	createProduct(@Args('input') input: CreateProductInput, @CurrentVendor() vendor?: Vendor) {
		return this.productService.create(input, vendor?.id);
	}

	@VerifiedVendor()
	@Mutation(() => Product)
	updateProduct(
		@Args('id', { type: () => Int }) id: number,
		@Args('input') input: UpdateProductInput,
		@CurrentVendor() vendor?: Vendor
	) {
		return this.productService.update(id, input, vendor?.id);
	}

	@VerifiedVendor()
	@Mutation(() => Boolean)
	deleteProduct(@Args('id', { type: () => Int }) id: number, @CurrentVendor() vendor?: Vendor) {
		return this.productService.delete(id, vendor?.id);
	}

	@VerifiedVendor()
	@Query(() => PaginatedProducts)
	myProducts(@Args() args: PaginationArgs, @CurrentVendor() vendor: Vendor) {
		if (!vendor) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.productService.findAll(args, vendor.id);
	}

	@OptionalAuth()
	@Query(() => PaginatedProducts)
	products(@Args() args: ProductsArgs, @CurrentUser() user?: User) {
		return this.productService.findAll(args, args.vendorId, user?.role === UserRole.Client ? user.id : undefined);
	}

	@ResolveField(() => Boolean)
	inStock(@Parent() product: Product) {
		return product.stock > 0;
	}
}
