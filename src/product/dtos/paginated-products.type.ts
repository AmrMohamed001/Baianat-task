import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';
import { Product } from '../product.entity';

@ObjectType() export class PaginatedProducts extends Paginated(Product) {}
