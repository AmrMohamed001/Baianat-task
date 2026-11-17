import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { OrderStatusHistory } from '../order/entities/order-status-history.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderHistoryLoader {
	constructor(@InjectRepository(OrderStatusHistory) private repo: Repository<OrderStatusHistory>) {}

	// order.history
	byOrderId = new DataLoader(async (orderIds: readonly number[]) => {
		const rows = await this.repo.find({ where: { orderId: In([...orderIds]) }, order: { createdAt: 'ASC', id: 'ASC' } });
		return orderIds.map((id) => rows.filter((r) => r.orderId === id));
	});
}
