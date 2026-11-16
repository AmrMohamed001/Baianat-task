import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Vendor } from '../vendor/vendor.entity';
import { Category } from '../category/category.entity';

 //gin indexes, created in the migration
@Index('IDX_products_search_vector_ar', { synchronize: false })
@Index('IDX_products_search_vector_en', { synchronize: false })
@Index(['vendorId'])
@Index(['categoryId'])
@Entity('sys_products')
@ObjectType()
export class Product {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	@Field(() => Int)
	vendorId: number;

	@ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'vendorId' })
	vendor: Vendor;

	@Column({ type: 'int', nullable: true }) // null only for soft-deleted products
	@Field(() => Int, { nullable: true })
	categoryId: number | null;

	@ManyToOne(() => Category, (category) => category.products, { onDelete: 'SET NULL' })
	@JoinColumn({ name: 'categoryId' })
	category: Category;

	@Column({ type: 'varchar', length: 120 })
	@Field()
	nameAr: string;

	@Column({ type: 'varchar', length: 120 })
	@Field()
	nameEn: string;

	@Column({ type: 'varchar', length: 2000, nullable: true })
	@Field(() => String, { nullable: true })
	descriptionAr: string | null;

	@Column({ type: 'varchar', length: 2000, nullable: true })
	@Field(() => String, { nullable: true })
	descriptionEn: string | null;

	@Column({ type: 'bigint', transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
	@Field(() => Int) // cents
	price: number;

	@Column({ type: 'int', default: 0 })
	@Field(() => Int)
	stock: number;

	@Column({
		type: 'tsvector',
		generatedType: 'STORED',
		asExpression: `setweight(to_tsvector('simple', coalesce("nameAr", '')), 'A') || setweight(to_tsvector('simple', coalesce("descriptionAr", '')), 'B')`,
		select: false,
	})
	searchVectorAr: string;

	@Column({
		type: 'tsvector',
		generatedType: 'STORED',
		asExpression: `setweight(to_tsvector('english', coalesce("nameEn", '')), 'A') || setweight(to_tsvector('english', coalesce("descriptionEn", '')), 'B')`,
		select: false,
	})
	searchVectorEn: string;

	@CreateDateColumn({ type: 'timestamptz' })
	@Field()
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	@Field()
	updatedAt: Date;

	@DeleteDateColumn({ type: 'timestamptz' })
	deletedAt: Date | null;
}
