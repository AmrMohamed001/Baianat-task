import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Cart } from './cart.entity';

@Injectable()
export class CartService {
	constructor(@InjectRepository(Cart) private cartRepo: Repository<Cart>) {}

	createForUser(userId: number, manager?: EntityManager) {
		const repo = manager ? manager.getRepository(Cart) : this.cartRepo;
		return repo.save(repo.create({ userId }));
	}
}
