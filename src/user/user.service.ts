import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './enums/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepo: Repository<User>,
		private readonly i18n: I18nService
	) {}

	private hashPassword(password: string)
	{
		return bcrypt.hash(password, 12);
	}

	async createUser(data: CreateUserDto,role: UserRole,manager?: EntityManager): Promise<User> {
		const repo = manager ? manager.getRepository(User) : this.userRepo;
		if (await this.userRepo.exists({ where: { email:data.email } })) throw new ConflictException(this.i18n.t('exceptions.EMAIL_ALREADY_USED'));

		const user = repo.create({
			...data,
			email:data.email,
			role,
			password: await this.hashPassword(data.password),
		});
		return repo.save(user);
	}
	//#region Find 
	findAll() {return this.userRepo.find()}
	 
	async findByEmailOrUsername(emailOrUsername: string) {
		return this.userRepo.findOne({where: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }]});
	}

	async findById(id: number) {
		const user = await this.userRepo.findOne({ where:{ id }});
		if (!user) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_USER'));
		return user;
	}

	getProfile(userId: number) {
		return this.findById(userId);
	}
	//#endregion

	//#region Update  
	async updateUserPassword(id: number, body: UpdatePasswordDto) {
		const { password, newPassword } = body;
		const user = await this.findById(id);

		if (!user) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_USER'));
		if (!(await bcrypt.compare(password, user.password))) throw new BadRequestException(this.i18n.t('exceptions.CURRENT_PASS_IS_INCORRECT'));

		user.password = await this.hashPassword(newPassword);
		user.changePasswordAt = new Date();
		return this.userRepo.save(user);
	}

	async updateUser(id: number, body: UpdateClientDto) {
		if (body.email && (await this.userRepo.exists({ where: { email: body.email } })))
			throw new ConflictException(this.i18n.t('exceptions.EMAIL_ALREADY_USED'));

		const { affected } = await this.userRepo.update(id, body);
		if (!affected) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_USER'));
		return true;
	}

	async updateRole(id: number, role: UserRole) {
		const { affected } = await this.userRepo.update(id, { role });
		if (!affected) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_USER'));
		return true;
	}
	//#endregion

	async deleteUser(id: number) {
		const user = await this.findById(id);
		await this.userRepo.remove(user);
		return true;
	}
}
