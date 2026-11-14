import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationArgs } from '../../common/query/types/pagination.args';
import { UserRole } from '../enums/user-role.enum';

@ArgsType()
export class UsersArgs extends PaginationArgs {
	@IsOptional()
	@IsEnum(UserRole)
	@Field(() => UserRole, { nullable: true })
	role?: UserRole;

	@IsOptional()
	@IsBoolean()
	@Field({ nullable: true })
	isActive?: boolean;
}
