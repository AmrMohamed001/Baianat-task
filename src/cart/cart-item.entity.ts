import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Cart } from './cart.entity';
import { Product } from '../product/product.entity';

@Index(['cartId', 'productId'], { unique: true }) // same product twice = one row, quantity summed
@Index(['productId'])
@Entity('sys_cart_items')
@ObjectType()
export class CartItem {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	cartId: number;

	@ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'cartId' })
	cart: Cart;

	@Column()
	@Field(() => Int)
	productId: number;

	@ManyToOne(() => Product, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'productId' })
	@Field(() => Product)
	product: Product;

	@Column({ type: 'int' })
	@Field(() => Int)
	quantity: number;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
