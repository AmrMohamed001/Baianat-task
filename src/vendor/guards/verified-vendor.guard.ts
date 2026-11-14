import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { UserRole } from '../../user/enums/user-role.enum';
import { VendorStatus } from '../enums/vendor-status.enum';
import { VendorService } from '../vendor.service';

@Injectable()
export class VerifiedVendorGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly vendorService: VendorService,
		private readonly i18n: I18nService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const required = this.reflector.getAllAndOverride('verifiedVendor', [context.getHandler(), context.getClass()]);
		if (!required) return true;

		const { req } = GqlExecutionContext.create(context).getContext();
		if (req.user.role === UserRole.SuperAdmin) return true;
		const vendor = await this.vendorService.findByOwner(req.user.id);
		if (vendor?.status !== VendorStatus.Verified)
			throw new ForbiddenException(this.i18n.t('exceptions.VENDOR_NOT_APPROVED'));

		req.vendor = vendor;
		return true;
	}
}
