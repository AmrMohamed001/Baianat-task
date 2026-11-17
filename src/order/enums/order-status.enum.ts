import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	Pending = 'Pending',
	Paid = 'Paid',
	Shipped = 'Shipped',
	Delivered = 'Delivered',
	Cancelled = 'Cancelled',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
