import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Order } from './order.entity';
import { Product } from '../../product/product.entity';

@Index(['orderId'])
@Entity('sys_order_items')
@ObjectType()
export class OrderItem {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	orderId: number;

	@ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'orderId' })
	order: Order;

	@Column({ type: 'int', nullable: true })
	@Field(() => Int, { nullable: true })
	productId: number | null;

	@ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'productId' })
	product: Product | null;

	// snapshot, so old orders load without the product row
	@Column({ type: 'varchar', length: 120 })
	@Field()
	nameAr: string;

	@Column({ type: 'varchar', length: 120 })
	@Field()
	nameEn: string;

	@Column({ type: 'bigint', transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
	@Field(() => Int) // cents, copied from the product at checkout
	priceAtPurchase: number;

	@Column({ type: 'int' })
	@Field(() => Int)
	quantity: number;
}
