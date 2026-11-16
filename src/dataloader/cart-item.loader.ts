import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { CartItem } from '../cart/cart-item.entity';

@Injectable({ scope: Scope.REQUEST })
export class CartItemLoader {
	constructor(@InjectRepository(CartItem) private repo: Repository<CartItem>) {}

	// cart.items
	byCartId = new DataLoader(async (cartIds: readonly number[]) => {
		const items = await this.repo.find({
			where: { cartId: In([...cartIds]) },
			relations: { product: { vendor: { owner: true } } },
			withDeleted: true,
			order: { createdAt: 'ASC', id: 'ASC' },
		});
		return cartIds.map((id) => items.filter((i) => i.cartId === id));
	});
}
