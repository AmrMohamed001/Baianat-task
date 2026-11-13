import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { CartService } from '../cart/cart.service';
import { UserRole } from '../user/enums/user-role.enum';
import { RegisterClientInput } from './dtos/register-client.dto';
import { LoginInput } from './dtos/login.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UserService,
		private readonly cartService: CartService,
		private readonly jwtService: JwtService,
		private readonly dataSource: DataSource,
		private readonly i18n: I18nService
	) {}

	async registerClient(input: RegisterClientInput) {
		await this.dataSource.transaction(async (manager) => {
			const user = await this.usersService.createUser(input,UserRole.Client,manager);
			await this.cartService.createForUser(user.id, manager);
		});
		return this.i18n.t('common.USER_CREATED');
	}

	async login(input: LoginInput) {
		const user = await this.usersService.findByEmailOrUsername(input.emailOrUsername.trim());
		const passwordMatches = await bcrypt.compare(input.password,user?.password||'');

		if (!user || !passwordMatches) throw new UnauthorizedException(this.i18n.t('exceptions.INVALID_CREDENTIALS'));
		if (!user.isActive) throw new UnauthorizedException(this.i18n.t('exceptions.ACCOUNT_DEACTIVATED'));

		const payload: JwtPayload = { sub: user.id, role: user.role };
		const accessToken = await this.jwtService.signAsync(payload);
		return { accessToken, user };
	}
}
