import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { VendorStatus } from './enums/vendor-status.enum';


@Entity('sys_vendors')
@ObjectType()
export class Vendor {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column()
	@Field(() => Int)
	ownerId: number;

	@OneToOne(() => User, (user) => user.vendor, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'ownerId' })
	owner: User;

	@Column({ type: 'varchar', length: 60 })
	@Field()
	storeName: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
	@Field(() => String, { nullable: true })
	description: string | null;

	@Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.Pending })
	@Field(() => VendorStatus)
	status: VendorStatus;

	// commission the platform (rate)
	@Column({
		type: 'numeric',
		precision: 5,
		scale: 2,
		default: 10,
		transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
	})
	@Field(() => Float)
	commissionRate: number;

	@Column({ type: 'int', default: 0 })
	@Field(() => Int)
	reviewsCount: number;

	@Column({
		type: 'numeric',
		precision: 2,
		scale: 1,
		default:4.5
	})
	@Field(() => Float)
	averageRating: number | null;

	@Column({ type: 'int', default: 0 })
	@Field(() => Int)
	followersCount: number;

	@Column({ type: 'int', nullable: true })
	@Field(() => Int, { nullable: true })
	reviewedBy: number | null;

	@ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'reviewedBy' })
	reviewer: User | null;

	@Column({ type: 'timestamptz', nullable: true })
	@Field(() => Date, { nullable: true })
	reviewedAt: Date | null;

	@Column({ type: 'varchar', length: 500, nullable: true })
	@Field(() => String, { nullable: true })
	rejectionReason: string | null;

	@CreateDateColumn()
	@Field()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
