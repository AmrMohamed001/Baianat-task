import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';
import { Product } from '../product.entity';

@ObjectType()
export class PopularProduct {
	@Field(() => Product)
	product: Product;

	@Field(() => Int)
	totalQuantity: number;
}

@ObjectType()
export class PaginatedPopularProducts extends Paginated(PopularProduct) {}
