import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { Vendor } from '../vendor/vendor.entity';

@Index(['clientId', 'vendorId'], { unique: true })
@Index(['vendorId'])
@Entity('sys_reviews')
@ObjectType()
export class Review {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	clientId: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'clientId' })
	client: User;

	@Column()
	@Field(() => Int)
	vendorId: number;

	@ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'vendorId' })
	vendor: Vendor;

	@Column({ type: 'smallint' })
	@Field(() => Int)
	rating: number;

	@Column({ type: 'varchar', length: 1000, nullable: true })
	@Field(() => String, { nullable: true })
	comment: string | null;

	@CreateDateColumn({ type: 'timestamptz' })
	@Field()
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	@Field()
	updatedAt: Date;
}
