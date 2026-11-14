import { Args, Int, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UsersArgs } from './dtos/users.args';
import { PaginatedUsers } from './dtos/paginated-users.type';
import { User } from './user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateClientDto } from './dtos/update-client.dto';
import { UpdateVendorDto } from './dtos/update-vendor.dto';
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

	@Roles(UserRole.Vendor)
	@Mutation(() => Boolean)
	updateMyVendorProfile(@Args('input') input: UpdateVendorDto, @CurrentUser() user: User) {
		return this.usersService.updateUser(user.id, input);
	}

	@Roles(UserRole.SuperAdmin)
	@Query(() => User)
	async user(@Args('id', { type: () => Int }) id: number) {
		return this.usersService.findById(id);
	}

	@Roles(UserRole.SuperAdmin)
	@Query(() => PaginatedUsers)
	users(@Args() args: UsersArgs) {
		return this.usersService.findAll(args);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => User)
	setUserActive(
		@Args('userId', { type: () => Int }) userId: number,
		@Args('isActive') isActive: boolean,
		@CurrentUser() admin: User
	) {
		return this.usersService.setActive(userId, isActive, admin.id);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Boolean)
	updateUser(
		@Args('id', { type: () => Int }) id: number,
		@Args('input') updateData: UpdateVendorDto
	) {
		return this.usersService.updateUser(id, updateData);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Boolean)
	async updateRole(
		@Args('id', { type: () => Int }) id: number,
		@Args('role', { type: () => UserRole }) role: UserRole
	) {
		return this.usersService.updateRole(id, role);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Boolean)
	async deleteUser(@Args('id', { type: () => Int }) id: number) {
		return this.usersService.deleteUser(id);
	}
}
