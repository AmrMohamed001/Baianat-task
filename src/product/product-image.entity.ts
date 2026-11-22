import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from './product.entity';

@Index(['productId'])
@Index(['key'], { unique: true })
@Entity('sys_product_images')
@ObjectType()
export class ProductImage {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	productId: number;

	@ManyToOne(() => Product, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'productId' })
	product: Product;

	@Column()
	key: string;

	@CreateDateColumn({ type: 'timestamptz' })
	@Field()
	createdAt: Date;

	// loader
	@Field()
	url: string;
}
