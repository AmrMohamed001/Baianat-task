import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './enums/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepo: Repository<User>,
		private readonly i18n: I18nService
	) {}

	createUser(body: CreateUserDto) {
		const user = this.userRepo.create(body);
		return this.userRepo.save(user);
	}

	findAll() {
		return this.userRepo.find();
	}

	findByEmail(email: string) {
		return this.userRepo.findOne({ where: { email } });
	}

	async findById(id: number) {
		const user = await this.userRepo.findOne({ where: { id } });
		if (!user)
			throw new NotFoundException(
				this.i18n.t('exceptions.NOT_FOUND_USER')
			);
		return user;
	}

	getProfile(userId: number) {
		return this.findById(userId);
	}


	async updateUserPassword(id: number, body: UpdatePasswordDto) {
		const { password, newPassword } = body;
		const user = await this.findById(id);

		if (!(await bcrypt.compare(password, user.password)))
			throw new BadRequestException(
				this.i18n.t('exceptions.CURRENT_PASS_IS_IN_CORRECT')
			);

		user.password = newPassword;
		user.changePasswordAt = new Date();
		return this.userRepo.save(user);
	}

	async updateUser(id: number, body: UpdateUserDto) {
		await this.updateOrThrow(id, body);
		return true;
	}

	async updateRole(id: number, role: UserRole) {
		await this.updateOrThrow(id, { role });
		return true;
	}

	private async updateOrThrow(
		id: number,
		values: UpdateUserDto | { role: UserRole }
	) {
		const { affected } = await this.userRepo.update(id, values);
		if (!affected)
			throw new NotFoundException(
				this.i18n.t('exceptions.NOT_FOUND_USER')
			);
	}

	async deleteUser(id: number) {
		const user = await this.findById(id);
		return this.userRepo.remove(user);
	}
}
