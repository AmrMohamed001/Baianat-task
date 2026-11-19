import { registerEnumType } from '@nestjs/graphql';

export enum PaymentStatus {
	Pending = 'Pending',
	Paid = 'Paid',
	Failed = 'Failed',
	Refunded = 'Refunded'
}

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
