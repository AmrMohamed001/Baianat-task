import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('sys_carts')
@ObjectType()
export class Cart {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	userId: number;

	@OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: User;

	@OneToMany(() => CartItem, (item) => item.cart)
	@Field(() => [CartItem])
	items: CartItem[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
