import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { StorageService } from '../storage/storage.service';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
	constructor(@InjectRepository(User) private repo: Repository<User>,private storage: StorageService) {}

	// review.client
	byId = new DataLoader(async (ids: readonly number[]) => {
		const users = await this.repo.find({ where: { id: In([...ids]) }, select: { id: true, fullname: true, photoKey: true } });
		return ids.map((id) => {
			const user = users.find((u) => u.id === id);
			if (!user) return null;
			return { id: user.id, fullname: user.fullname, 
				photoUrl: user.photoKey ? this.storage.urlFor(user.photoKey) : null };
		});
	});
}
