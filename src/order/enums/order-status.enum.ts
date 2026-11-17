import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	Pending = 'Pending',
	Processing = 'Processing',
	Shipped = 'Shipped',
	Delivered = 'Delivered',
	Cancelled = 'Cancelled',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
