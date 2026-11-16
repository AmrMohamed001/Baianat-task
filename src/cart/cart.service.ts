import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
	constructor(
		@InjectRepository(Cart) private cartRepo: Repository<Cart>,
		@InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
		private readonly productService: ProductService,
		private readonly dataSource: DataSource,
		private readonly i18n: I18nService
	) {}

	createForUser(userId: number, manager?: EntityManager) {
		const repo = manager ? manager.getRepository(Cart) : this.cartRepo;
		return repo.save(repo.create({ userId }));
	}

	private async findOrCreate(userId: number) {
		return (await this.cartRepo.findOne({ where: { userId } })) ?? this.cartRepo.save(this.cartRepo.create({ userId }));
	}

	async myCart(userId: number) {
		const { id } = await this.findOrCreate(userId);
		return this.cartRepo.findOne({
			where: { id },
			relations: { items: { product: { vendor: { owner: true } } } },
			withDeleted: true, //soft deleted products stay in the cart, marked available = false
			order: { items: { createdAt: 'ASC', id: 'ASC' } },
		});
	}

	async add(userId: number, productId: number, quantity: number) {
		const { id: cartId } = await this.findOrCreate(userId);
		const product = await this.productService.findAvailable(productId);
		if (!product) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT'));

		await this.dataSource.transaction(async (manager) => { // race lock
			await manager.findOneOrFail(Cart, { where: { id: cartId }, lock: { mode: 'pessimistic_write' } });
			const item = await manager.findOne(CartItem, { where: { cartId, productId } });
			const total = (item?.quantity ?? 0) + quantity;
			if (total > product.stock) throw new BadRequestException(this.i18n.t('exceptions.NOT_ENOUGH_STOCK', { args: { stock: product.stock } }));

			await manager.save(item ? Object.assign(item, { quantity: total }) : manager.create(CartItem, { cartId, productId, quantity: total }));
		});
		return this.myCart(userId);
	}

	async update(userId: number, productId: number, quantity: number) {
		if (quantity === 0) return this.remove(userId, productId);

		const { id: cartId } = await this.findOrCreate(userId);
		const product = await this.productService.findAvailable(productId);
		if (!product) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_PRODUCT'));

		await this.dataSource.transaction(async (manager) => {
			await manager.findOneOrFail(Cart, { where: { id: cartId }, lock: { mode: 'pessimistic_write' } });
			const item = await manager.findOne(CartItem, { where: { cartId, productId } });
			if (!item) throw new NotFoundException(this.i18n.t('exceptions.NOT_IN_CART'));
			if (quantity > product.stock) throw new BadRequestException(this.i18n.t('exceptions.NOT_ENOUGH_STOCK', { args: { stock: product.stock } }));

			await manager.update(CartItem, item.id, { quantity });
		});
		return this.myCart(userId);
	}

	async remove(userId: number, productId: number) {
		const cart = await this.findOrCreate(userId);
		await this.itemRepo.delete({ cartId: cart.id, productId });
		return this.myCart(userId);
	}

	async clear(userId: number) {
		const cart = await this.findOrCreate(userId);
		await this.itemRepo.delete({ cartId: cart.id });
		return this.myCart(userId);
	}
}
