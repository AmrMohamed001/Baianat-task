import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './create-product.dto';

@InputType()
export class UpdateProductInput extends PartialType(OmitType(CreateProductInput, ['vendorId'] as const)) {}
