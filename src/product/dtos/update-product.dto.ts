import { InputType, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './create-product.dto';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {}
