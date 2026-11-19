import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Checkout } from './checkout.entity';
import { OrderItem } from './order-item.entity';
import { Vendor } from '../../vendor/vendor.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Index(['checkoutId'])
@Index(['vendorId'])
@Entity('sys_orders')
@ObjectType()
export class Order {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	checkoutId: number;

	@ManyToOne(() => Checkout, (checkout) => checkout.orders, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'checkoutId' })
	checkout: Checkout;

	@Column()
	@Field(() => Int)
	vendorId: number;

	@ManyToOne(() => Vendor)
	@JoinColumn({ name: 'vendorId' })
	vendor: Vendor;

	@Column({ type: 'bigint', transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
	@Field(() => Int) // cents
	total: number;

	@Column({ type: 'bigint', transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
	@Field(() => Int) // cents
	commissionAmount: number;

	@Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
	@Field(() => OrderStatus)
	status: OrderStatus;

	@Column({ type: 'varchar', length: 255, nullable: true })
	stripeRefundId: string | null;

	@OneToMany(() => OrderItem, (item) => item.order)
	@Field(() => [OrderItem])
	items: OrderItem[];

	@CreateDateColumn({ type: 'timestamptz' })
	@Field()
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
