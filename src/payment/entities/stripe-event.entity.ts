import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('sys_stripe_events')
export class StripeEvent {
	@PrimaryColumn({ type: 'varchar', length: 255 })
	id: string;

	@Column({ type: 'varchar', length: 100 })
	type: string;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}
