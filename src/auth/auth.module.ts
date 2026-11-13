import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { CartModule } from '../cart/cart.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
	imports: [
		UserModule,
		CartModule,
		JwtModule.registerAsync({
			global: true,
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.getOrThrow('JWT_SECRET'),
				signOptions: {expiresIn: config.getOrThrow('JWT_EXPIRES_IN')}
			})
		})
	],
	providers: [
		AuthService,
		AuthResolver,
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
})
export class AuthModule {}
