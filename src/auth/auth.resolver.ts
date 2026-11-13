import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterClientInput } from './dtos/register-client.dto';
import { LoginInput } from './dtos/login.dto';
import { AuthPayload } from './dtos/auth-payload.dto';
import { Public } from './decorators/public.decorator';

@Resolver()
export class AuthResolver {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Mutation(() => String)
	registerClient(@Args('input') input: RegisterClientInput) {
		return this.authService.registerClient(input);
	}

	@Public()
	@Mutation(() => AuthPayload)
	login(@Args('input') input: LoginInput) {
		return this.authService.login(input);
	}
}
