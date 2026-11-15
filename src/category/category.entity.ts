import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@Index(['nameAr'], { unique: true })
@Index(['nameEn'], { unique: true })
@Entity('sys_categories')
@ObjectType()
export class Category {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column({ type: 'varchar', length: 50 })
	@Field()
	nameAr: string;

	@Column({ type: 'varchar', length: 50 })
	@Field()
	nameEn: string;

	@CreateDateColumn({ type: 'timestamptz' })
	@Field()
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
