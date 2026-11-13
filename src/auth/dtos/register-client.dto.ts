import { InputType } from '@nestjs/graphql';
import { CreateUserDto } from '../../user/dtos/create-user.dto';

@InputType()
export class RegisterClientInput extends CreateUserDto {}
