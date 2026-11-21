import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	// review.client
	byId = new DataLoader(async (ids: readonly number[]) => {
		const users = await this.repo.find({ where: { id: In([...ids]) }, select: { id: true, fullname: true, image: true } });
		return ids.map((id) => users.find((u) => u.id === id) ?? null);
	});
}
