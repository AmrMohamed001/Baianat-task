import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';
import { Order } from '../entities/order.entity';

@ObjectType() export class PaginatedOrders extends Paginated(Order) {}
