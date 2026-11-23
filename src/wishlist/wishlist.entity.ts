import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';

@Index(['clientId', 'productId'], { unique: true })
@Entity('sys_wishlist_items')
export class WishlistItem {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	clientId: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'clientId' })
	client: User;

	@Column()
	productId: number;

	@ManyToOne(() => Product, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'productId' })
	product: Product;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}
