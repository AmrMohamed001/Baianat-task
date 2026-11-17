import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { OrderItem } from '../order/entities/order-item.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderItemLoader {
	constructor(@InjectRepository(OrderItem) private repo: Repository<OrderItem>) {}

	// order.items
	byOrderId = new DataLoader(async (orderIds: readonly number[]) => {
		const items = await this.repo.find({ where: { orderId: In([...orderIds]) }, order: { id: 'ASC' } });
		return orderIds.map((id) => items.filter((i) => i.orderId === id));
	});
}
