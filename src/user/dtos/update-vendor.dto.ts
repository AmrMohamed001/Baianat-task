import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { RegisterVendorInput } from '../../auth/dtos/register-vendor.dto';

@InputType()
export class UpdateVendorDto extends PartialType(
	OmitType(RegisterVendorInput, ['password'] as const)
) {}
