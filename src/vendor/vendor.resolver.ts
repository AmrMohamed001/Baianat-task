import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
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
