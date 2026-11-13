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

@Entity('sys_carts')
export class Cart {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userId: number;

	@OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: User;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
