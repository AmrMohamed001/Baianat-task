import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { hash } from 'bcryptjs';
import { BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserRole } from './enums/user-role.enum';

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


	@Column({ nullable: true })
	@Field({ nullable: true })
	phone: string;

	@CreateDateColumn()
	@Field({ nullable: true })
	createdAt: Date;

	@UpdateDateColumn()
	@Field({ nullable: true })
	updatedAt: Date;

	// Runs on create and on `save`. Updates that must not re-hash
	// (profile, role) use `repo.update`, which skips entity listeners.
	@BeforeInsert()
	@BeforeUpdate()
	async hashPassword() {
		if (!this.password) {
			throw new BadRequestException(
				I18nContext.current()?.t('exceptions.PASSWORD_REQUIRED')
			);
		}
		this.password = await hash(this.password, 12);
	}
}
