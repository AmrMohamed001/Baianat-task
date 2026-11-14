import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';

export const VerifiedVendor = () =>
	applyDecorators(Roles(UserRole.Vendor), SetMetadata('verifiedVendor', true));
