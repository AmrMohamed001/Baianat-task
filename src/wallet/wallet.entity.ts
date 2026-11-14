import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.entity';

@Entity('sys_wallets')
@ObjectType()
export class Wallet {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
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
	@Field(() => Float) // cents,
	balance: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
