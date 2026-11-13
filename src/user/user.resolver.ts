import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserService } from './user.service';
import { currentUser } from '../common/decorators/current-user.decorator';
import { UpdateClientDto } from './dtos/update-client.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@UseGuards(GqlAuthGuard)
@Resolver(() => User)
export class UserResolver {
	constructor(private usersService: UserService) {}

	@Query(() => User)
	me(@currentUser() user: User) {
		return user;
	}

	@Mutation(() => Boolean)
	async updateMyClientProfile(
		@Args('input') input: UpdateClientDto,
		@currentUser() user: User
	) {
		return this.usersService.updateUser(user.id, input);
	}

	// @Role('admin')
	@Query(() => User)
	async user(@Args('id') id: number) {
		return this.usersService.findById(id);
	}

	// @Role('admin')
	@Query(() => [User])
	async users() {
		return this.usersService.findAll();
	}

	// @Role('admin')
	// TODO(vendor task): take UpdateVendorDto, which has every field.
	@Mutation(() => Boolean)
	updateUser(
		@Args('id') id: number,
		@Args('input') updateData: UpdateClientDto
	) {
		return this.usersService.updateUser(id, updateData);
	}

	// @Role('admin')
	@Mutation(() => Boolean)
	async updateRole(
		@Args('id') id: number,
		@Args('role', { type: () => UserRole }) role: UserRole
	) {
		return this.usersService.updateRole(id, role);
	}

	// @Role('admin')
	@Mutation(() => User)
	async deleteUser(@Args('id') id: number) {
		return this.usersService.deleteUser(id);
	}
}
