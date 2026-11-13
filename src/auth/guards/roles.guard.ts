import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { UserRole } from '../../user/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly i18n: I18nService
	) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.getAllAndOverride('roles', [context.getHandler(),context.getClass()]);
		if (!roles?.length) return true;

		const { req } = GqlExecutionContext.create(context).getContext();
		const role: UserRole = req.user?.role;

		if (role === UserRole.SuperAdmin) return true;
		if (!role || !roles.includes(role)) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return true;
	}
}
