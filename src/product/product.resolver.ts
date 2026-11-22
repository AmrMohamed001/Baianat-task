import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { CreateProductInput } from './dtos/create-product.dto';
import { UpdateProductInput } from './dtos/update-product.dto';
import { PaginatedProducts } from './dtos/paginated-products.type';
import { ProductImage } from './product-image.entity';
import { PresignedUpload } from '../storage/dtos/presigned-upload.type';
import { ImageContentType } from '../storage/enums/image-content-type.enum';
import { ProductImageLoader } from '../dataloader/product-image.loader';
import { ProductsArgs } from './dtos/products.args';
import { Vendor } from '../vendor/vendor.entity';
import { VerifiedVendor } from '../vendor/decorators/verified-vendor.decorator';
import { CurrentVendor } from '../vendor/decorators/current-vendor.decorator';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { UserRole } from '../user/enums/user-role.enum';
import { PublicVendor } from '../vendor/dtos/public-vendor.type';
import { Category } from '../category/category.entity';
import { VendorLoader } from '../dataloader/vendor.loader';
import { CategoryLoader } from '../dataloader/category.loader';

@Resolver(() => Product)
export class ProductResolver {
	constructor(
		private readonly productService: ProductService,
		private readonly vendorLoader: VendorLoader,
		private readonly categoryLoader: CategoryLoader,
		private readonly productImageLoader: ProductImageLoader,
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
	@Mutation(() => PresignedUpload)
	createProductImageUpload(
		@Args('productId', { type: () => Int }) productId: number,
		@Args('contentType', { type: () => ImageContentType }) contentType: ImageContentType,
		@CurrentVendor() vendor?: Vendor
	) {
		return this.productService.createImageUpload(productId, contentType, vendor?.id);
	}

	@VerifiedVendor()
	@Mutation(() => Product)
	addProductImages(
		@Args('productId', { type: () => Int }) productId: number,
		@Args('keys', { type: () => [String] }) keys: string[],
		@CurrentVendor() vendor?: Vendor
	) {
		return this.productService.addImages(productId, keys, vendor?.id);
	}

	@VerifiedVendor()
	@Mutation(() => Product)
	removeProductImage(
		@Args('productId', { type: () => Int }) productId: number,
		@Args('imageId', { type: () => Int }) imageId: number,
		@CurrentVendor() vendor?: Vendor
	) {
		return this.productService.removeImage(productId, imageId, vendor?.id);
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

	@ResolveField(() => String)
	name(@Parent() product: Product) {
		return I18nContext.current()?.lang === 'en' ? product.nameEn : product.nameAr;
	}

	@ResolveField(() => String, { nullable: true })
	description(@Parent() product: Product) {
		return I18nContext.current()?.lang === 'en' ? product.descriptionEn : product.descriptionAr;
	}

	@ResolveField(() => [ProductImage])
	images(@Parent() product: Product) {
		return this.productImageLoader.byProductId.load(product.id);
	}

	@ResolveField(() => PublicVendor)
	vendor(@Parent() product: Product) {
		return this.vendorLoader.byId.load(product.vendorId);
	}

	@ResolveField(() => Category, { nullable: true })
	category(@Parent() product: Product) {
		if (product.categoryId === null) return null; // only soft-deleted products whose category was deleted
		return this.categoryLoader.byId.load(product.categoryId);
	}
}
