import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { Vendor } from '../vendor/vendor.entity';
import { UpdateVendorDto } from './dtos/update-vendor.dto';
import { UserRole } from './enums/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { UsersArgs } from './dtos/users.args';
import { QueryService } from '../common/query/query.service';
import { StorageService } from '../storage/storage.service';
import { uploadProfiles } from '../storage/upload-profiles';
import { ImageContentType } from '../storage/enums/image-content-type.enum';

@Injectable()
export class UserService {
	constructor(
		private readonly query: QueryService,
		@InjectRepository(User) private userRepo: Repository<User>,
		private readonly dataSource: DataSource,
		private readonly storage: StorageService,
		private readonly logger: Logger,
		private readonly i18n: I18nService
	) {}

	private hashPassword(password: string)
	{
		return bcrypt.hash(password, 12);
	}

	async createUser(data: CreateUserDto,role: UserRole,manager?: EntityManager): Promise<User> {
		const repo = manager ? manager.getRepository(User) : this.userRepo;
		if (await repo.exists({ where: { email:data.email } })) throw new ConflictException(this.i18n.t('exceptions.EMAIL_ALREADY_USED'));

		const user = repo.create({
			...data,
			email:data.email,
			role,
			password: await this.hashPassword(data.password),
		});
		return repo.save(user);
	}
	//#region Find 
	findAll(args: UsersArgs) {
		const qb = this.userRepo.createQueryBuilder('u');
		this.query.sort(qb, 'createdAt');
		if (args.role) qb.andWhere('u.role = :role', { role: args.role });
		if (args.isActive != null) qb.andWhere('u.isActive = :isActive', { isActive: args.isActive });
		return this.query.getPage(qb, args);
	}
	 
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

	//#region Photo
	createPhotoUpload(userId: number, contentType: ImageContentType) {
		return this.storage.createPresignedUpload(uploadProfiles.userPhoto, userId, contentType);
	}

	async setPhoto(userId: number, key: string) {
		await this.storage.verifyUpload(uploadProfiles.userPhoto, userId, key);
		const user = await this.findById(userId);
		const oldKey = user.photoKey;
		if (oldKey) this.storage.deleteObject(oldKey).catch((e) => this.logger.error(e.message, e.stack));
		await this.userRepo.update(userId, { photoKey: key });
		user.photoKey = key;
		return user;
	}

	async removePhoto(userId: number) {
		const user = await this.findById(userId);
		const oldKey = user.photoKey;
		if (oldKey) this.storage.deleteObject(oldKey).catch((e) => this.logger.error(e.message, e.stack));
		await this.userRepo.update(userId, { photoKey: null });
		user.photoKey = null;
		return user;
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

	async updateUser(id: number, body: UpdateClientDto | UpdateVendorDto) {
		const { storeName, description, ...userData } = body as UpdateVendorDto;
		const isStoreUpdate = storeName !== undefined || description !== undefined;

		return this.dataSource.transaction(async (m) => {
			const user = await m.findOneBy(User, { id });
			if (!user) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_USER'));
			if (isStoreUpdate && user.role !== UserRole.Vendor)
				throw new BadRequestException(this.i18n.t('exceptions.NOT_A_VENDOR'));
			if (userData.email && (await m.existsBy(User, { email: userData.email, id: Not(id) })))
				throw new ConflictException(this.i18n.t('exceptions.EMAIL_ALREADY_USED'));

			await m.save(User, Object.assign(user, userData));
			if (isStoreUpdate) await m.update(Vendor, { ownerId: id }, { storeName, description });
			return true;
		});
	}

	async setActive(userId: number, isActive: boolean, adminId: number) {
		if (userId === adminId && !isActive) throw new BadRequestException(this.i18n.t('exceptions.CANNOT_DEACTIVATE_SELF'));

		const user = await this.findById(userId);
		await this.userRepo.update(userId, { isActive });
		return Object.assign(user, { isActive });
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
