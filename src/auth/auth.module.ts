import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { CartModule } from '../cart/cart.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { GqlAuthGuard } from './guards/gql-auth.guard';

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
	providers: [AuthService, AuthResolver, GqlAuthGuard],
	exports: [GqlAuthGuard],
})
export class AuthModule {}
