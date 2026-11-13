import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.entity';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwtService: JwtService,
		private readonly usersService: UserService,
		private readonly i18n: I18nService
	) {}

	private passwordChangedAfter(user: User, iat: number) {
		if (!user.changePasswordAt) return false;
		return Math.floor(user.changePasswordAt.getTime() / 1000) > iat;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride('isPublic', [context.getHandler(),context.getClass()]);
		if (isPublic) return true;

		const { req } = GqlExecutionContext.create(context).getContext();
		const [bearer, token] = req?.headers?.authorization?.split(' ') ?? [];

		if (bearer !== 'Bearer' || !token) throw new UnauthorizedException(
			this.i18n.t('exceptions.UNAUTHENTICATED'));

		let payload: JwtPayload & { iat: number };
		try {
			payload = await this.jwtService.verifyAsync(token);
		} catch (error) {
			throw new UnauthorizedException(this.i18n.t(error instanceof TokenExpiredError? 'exceptions.JWT_EXPIRED': 'exceptions.NOT_VALID_TOKEN'));
		}

		const user = await this.usersService
			.findById(payload.sub)
			.catch(() => null);
		if (!user) throw new UnauthorizedException(this.i18n.t('exceptions.NOT_VALID_TOKEN'));
		if (!user.isActive) throw new UnauthorizedException(this.i18n.t('exceptions.ACCOUNT_DEACTIVATED'));
		if (this.passwordChangedAfter(user, payload.iat)) throw new UnauthorizedException(this.i18n.t('exceptions.PASSWORD_AFTER_JWT'));

		req.user = user;
		return true;
	}
}
