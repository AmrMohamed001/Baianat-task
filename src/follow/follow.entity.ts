import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Vendor } from '../vendor/vendor.entity';

@Index(['clientId', 'vendorId'], { unique: true })
@Index(['vendorId'])
@Entity('sys_vendor_follows')
export class VendorFollow {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	clientId: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'clientId' })
	client: User;

	@Column()
	vendorId: number;

	@ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'vendorId' })
	vendor: Vendor;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}
