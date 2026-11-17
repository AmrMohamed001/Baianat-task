import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { Order } from './order.entity';
import { PaymentStatus } from './enums/payment-status.enum';

@Index(['clientId'], { unique: true, where: `"status" = 'Pending'` }) // safe net
@Entity('sys_checkouts')
@ObjectType()
export class Checkout {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	clientId: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'clientId' })
	client: User;

	@Column({ type: 'bigint', transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
	@Field(() => Int) // cents
	total: number;

	@Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.Pending })
	@Field(() => PaymentStatus)
	status: PaymentStatus;

	@Column({ type: 'varchar', nullable: true, unique: true })
	@Field(() => String, { nullable: true })
	paymentIntentId: string | null;

	@OneToMany(() => Order, (order) => order.checkout)
	@Field(() => [Order])
	orders: Order[];

	@CreateDateColumn({ type: 'timestamptz' })
	@Field()
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
