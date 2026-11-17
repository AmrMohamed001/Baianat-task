import { registerEnumType } from '@nestjs/graphql';

export enum PaymentStatus {
	Pending = 'Pending',
	Paid = 'Paid',
	Failed = 'Failed',
	Expired = 'Expired',
}

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
