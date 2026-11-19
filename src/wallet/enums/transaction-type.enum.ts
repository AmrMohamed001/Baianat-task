import { registerEnumType } from '@nestjs/graphql';

export enum TransactionType {
	Sale = 'Sale',
	Payout = 'Payout',
	Refund = 'Refund',
}

registerEnumType(TransactionType, { name: 'TransactionType' });
