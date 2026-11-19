import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Wallet } from './wallet.entity';
import { Order } from '../order/entities/order.entity';
import { TransactionType } from './enums/transaction-type.enum';

@Index(['walletId'])
@Index(['paymentIntentId'])
@Entity('sys_transactions')
@ObjectType()
export class Transaction {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	walletId: number;

	@ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'walletId' })
	wallet: Wallet;

	@Column({ type: 'enum', enum: TransactionType })
	@Field(() => TransactionType)
	type: TransactionType;

	@Column({ type: 'bigint', transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
	@Field(() => Int)
	amount: number;

	@Column({ type: 'int', nullable: true })
	@Field(() => Int, { nullable: true })
	orderId: number | null;

	@ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'orderId' })
	order: Order | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	@Field(() => String, { nullable: true})
	paymentIntentId: string | null;

	@CreateDateColumn({ type: 'timestamptz' })
	@Field()
	createdAt: Date;
}
