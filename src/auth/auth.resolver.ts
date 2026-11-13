import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterClientInput } from './dtos/register-client.dto';
import { LoginInput } from './dtos/login.dto';
import { AuthPayload } from './dtos/auth-payload.dto';

@Resolver()
export class AuthResolver {
	constructor(private readonly authService: AuthService) {}

	@Mutation(() => String)
	registerClient(@Args('input') input: RegisterClientInput) {
		return this.authService.registerClient(input);
	}

	@Mutation(() => AuthPayload)
	login(@Args('input') input: LoginInput) {
		return this.authService.login(input);
	}
}
