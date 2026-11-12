import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserService } from './user.service';
import { currentUser } from '../common/decorators/current-user.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SerializedUser } from './types/serialized-user.type';
import { I18nService } from 'nestjs-i18n';


@Resolver(() => SerializedUser)
export class UserResolver {
	constructor(
		private usersService: UserService,
		private readonly i18n: I18nService
	) {}


	@Mutation(() => SerializedUser)
	async createUser(@Args('input') input: CreateUserDto) {
		return this.usersService.createUser(input);
	}

	@Mutation(() => Boolean)
	async updateMe(
		@Args('input') input: UpdateUserDto,
		@currentUser() user: Partial<User>
	) {
		return this.usersService.updateUser(user.id!, input);
	}

	// @Role('admin')
	@Query(() => SerializedUser)
	async user(@Args('id') id: number) {
		return this.usersService.findById(id);
	}

	// @Role('admin')
	@Query(() => [SerializedUser])
	async users() {
		return this.usersService.findAll();
	}

	// @Role('admin')
	@Mutation(() => Boolean)
	updateUser(
		@Args('id') id: number,
		@Args('input') updateData: UpdateUserDto
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
	@Mutation(() => SerializedUser)
	async deleteUser(@Args('id') id: number) {
		return this.usersService.deleteUser(id);
	}
}
