import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateClientDto } from './dtos/update-client.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver(() => User)
export class UserResolver {
	constructor(private usersService: UserService) {}

	@Query(() => User)
	me(@CurrentUser() user: User) {
		return user;
	}

	@Roles(UserRole.Client)
	@Mutation(() => Boolean)
	async updateMyClientProfile(
		@Args('input') input: UpdateClientDto,
		@CurrentUser() user: User
	) {
		return this.usersService.updateUser(user.id, input);
	}

	@Roles(UserRole.SuperAdmin)
	@Query(() => User)
	async user(@Args('id') id: number) {
		return this.usersService.findById(id);
	}

	@Roles(UserRole.SuperAdmin)
	@Query(() => [User])
	async users() {
		return this.usersService.findAll();
	}

	// TODO(vendor task): take UpdateVendorDto, which has every field.
	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Boolean)
	updateUser(
		@Args('id') id: number,
		@Args('input') updateData: UpdateClientDto
	) {
		return this.usersService.updateUser(id, updateData);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Boolean)
	async updateRole(
		@Args('id') id: number,
		@Args('role', { type: () => UserRole }) role: UserRole
	) {
		return this.usersService.updateRole(id, role);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Boolean)
	async deleteUser(@Args('id') id: number) {
		return this.usersService.deleteUser(id);
	}
}
