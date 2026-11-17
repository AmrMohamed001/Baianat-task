import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Order } from './order.entity';
import { User } from '../../user/user.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Index(['orderId'])
@Entity('sys_order_status_history')
@ObjectType()
export class OrderStatusHistory {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	orderId: number;

	@ManyToOne(() => Order, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'orderId' })
	order: Order;

	@Column({ type: 'enum', enum: OrderStatus })
	@Field(() => OrderStatus)
	status: OrderStatus;

	@Column({ type: 'int', nullable: true })
	@Field(() => Int, { nullable: true })
	changedBy: number | null;

	@ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'changedBy' })
	changer: User | null;

	@CreateDateColumn({ type: 'timestamptz' })
	@Field()
	createdAt: Date;
}
