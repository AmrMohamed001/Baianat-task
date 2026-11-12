import { CreateUserDto } from './create-user.dto';
import { InputType, OmitType, PartialType } from '@nestjs/graphql';

// Password changes go through UpdatePasswordDto so they are always hashed.
@InputType()
export class UpdateUserDto extends PartialType(
	OmitType(CreateUserDto, ['password'] as const)
) {}
