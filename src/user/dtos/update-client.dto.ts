import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { RegisterClientInput } from '../../auth/dtos/register-client.dto';

@InputType()
export class UpdateClientDto extends PartialType(
	OmitType(RegisterClientInput, ['password'] as const)
) {}
