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
import { User } from '../user/user.entity';
import { VendorStatus } from './enums/vendor-status.enum';


@Entity('sys_vendors')
export class Vendor {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	ownerId: number;

	@OneToOne(() => User, (user) => user.vendor, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'ownerId' })
	owner: User;

	@Column({ type: 'varchar', length: 60 })
	storeName: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
	description: string | null;

	@Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.Pending })
	status: VendorStatus;

	// commission the platform (rate)
	@Column({
		type: 'numeric',
		precision: 5,
		scale: 2,
		default: 10,
		transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
	})
	commissionRate: number;

	@Column({ type: 'int', nullable: true })
	approvedBy: number | null;

	@ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'approvedBy' })
	approver: User | null;

	@Column({ type: 'timestamptz', nullable: true })
	approvedAt: Date | null;

	@Column({ type: 'varchar', length: 500, nullable: true })
	rejectionReason: string | null;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
