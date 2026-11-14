import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VendorsArgs } from './dtos/vendors.args';
import { PaginatedVendors } from './dtos/paginated-vendors.type';
import { SetVendorCommissionArgs } from './dtos/set-vendor-commission.args';
import { VendorService } from './vendor.service';
import { RejectVendorInput } from './dtos/reject-vendor.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';
import { Vendor } from './vendor.entity';

@Resolver()
export class VendorResolver {
	constructor(private readonly vendorService: VendorService) {}

	@Roles(UserRole.SuperAdmin)
	@Query(() => PaginatedVendors)
	vendors(@Args() args: VendorsArgs) {
		return this.vendorService.findAll(args);
	}

	//for pending vendors too
	@Roles(UserRole.Vendor)
	@Query(() => Vendor)
	myStore(@CurrentUser() user: User) {
		return this.vendorService.findMyStore(user.id);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Vendor)
	setVendorCommission(@Args() args: SetVendorCommissionArgs) {
		return this.vendorService.setCommission(args.vendorId, args.commissionRate);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Vendor)
	approveVendor(
		@Args('vendorId', { type: () => Int }) vendorId: number,
		@CurrentUser() admin: User
	) {
		return this.vendorService.approve(vendorId, admin.id);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Vendor)
	rejectVendor(
		@Args('vendorId', { type: () => Int }) vendorId: number,
		@Args('input', { nullable: true }) input: RejectVendorInput,
		@CurrentUser() admin: User
	) {
		return this.vendorService.reject(vendorId, admin.id, input?.reason);
	}
}
