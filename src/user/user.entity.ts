import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserRole } from './enums/user-role.enum';
import { Cart } from '../cart/cart.entity';

@Index(['email'], { unique: true })
@Entity("sys_users")
@ObjectType()
export class User {
	@PrimaryGeneratedColumn()
	@Field(() => Int)
	id: number;

	@Column({ unique: true })
	@Field()
	username: string;

	@Column()
	@Field()
	fullname: string;

	@Column()
	@Field()
	email: string;

	@Column()
	password: string;

	@Column({ type: 'timestamptz', nullable: true })
	changePasswordAt: Date | null;

	@Column({ nullable: true })
	@Field({ nullable: true })
	image: string;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.Client })
	@Field(() => UserRole)
	role: UserRole;

	@Column({ default: false })
	isVerified: boolean;

	@Column({ default: true })
	isActive: boolean;

	@Column({ nullable: true })
	@Field({ nullable: true })
	phone: string;

	@CreateDateColumn()
	@Field({ nullable: true })
	createdAt: Date;

	@UpdateDateColumn()
	@Field({ nullable: true })
	updatedAt: Date;

	@OneToOne(() => Cart, (cart) => cart.user)
	cart: Cart;
}