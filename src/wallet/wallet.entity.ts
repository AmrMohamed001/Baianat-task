import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('sys_wallets')
export class Wallet {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userId: number;

	@OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column({
		type: 'bigint',
		default: 0,
		transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
	})
	balance: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
