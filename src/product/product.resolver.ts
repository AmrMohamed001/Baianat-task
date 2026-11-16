import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { CreateProductInput } from './dtos/create-product.dto';
import { UpdateProductInput } from './dtos/update-product.dto';
import { PaginatedProducts } from './dtos/paginated-products.type';
import { Vendor } from '../vendor/vendor.entity';
import { VerifiedVendor } from '../vendor/decorators/verified-vendor.decorator';
import { CurrentVendor } from '../vendor/decorators/current-vendor.decorator';
import { PaginationArgs } from '../common/query/types/pagination.args';

@Resolver(() => Product)
export class ProductResolver {
	constructor(
		private readonly productService: ProductService,
		private readonly i18n: I18nService
	) {}

	@VerifiedVendor()
	@Mutation(() => Product)
	createProduct(@Args('input') input: CreateProductInput, @CurrentVendor() vendor: Vendor) {
		if (!vendor) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN')); // admin: no vendor
		return this.productService.create(vendor.id, input);
	}

	@VerifiedVendor()
	@Mutation(() => Product)
	updateProduct(
		@Args('id', { type: () => Int }) id: number,
		@Args('input') input: UpdateProductInput,
		@CurrentVendor() vendor: Vendor
	) {
		if (!vendor) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.productService.update(vendor.id, id, input);
	}

	@VerifiedVendor()
	@Query(() => PaginatedProducts)
	myProducts(@Args() args: PaginationArgs, @CurrentVendor() vendor: Vendor) {
		if (!vendor) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.productService.myProducts(vendor.id, args);
	}
}
