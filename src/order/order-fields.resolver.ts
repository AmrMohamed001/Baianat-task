import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Order } from './order.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { OrderHistoryLoader } from '../dataloader/order-history.loader';

@Resolver(() => Order)
export class OrderFieldsResolver {
	constructor(private readonly historyLoader: OrderHistoryLoader) {}

	@ResolveField(() => [OrderStatusHistory])
	history(@Parent() order: Order) {
		return this.historyLoader.byOrderId.load(order.id);
	}
}
