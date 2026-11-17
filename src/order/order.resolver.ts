import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { OrderService } from './order.service';
import { Checkout } from './checkout.entity';
import { Order } from './order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { VerifiedVendor } from '../vendor/decorators/verified-vendor.decorator';
import { CurrentVendor } from '../vendor/decorators/current-vendor.decorator';
import { Vendor } from '../vendor/vendor.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';

@Resolver(() => Checkout)
export class OrderResolver {
	constructor(
		private readonly orderService: OrderService,
		private readonly i18n: I18nService
	) {}

	@Roles(UserRole.Client)
	@Mutation(() => Checkout)
	checkout(@CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.orderService.checkout(user.id);
	}

	@VerifiedVendor()
	@Mutation(() => Order)
	updateOrderStatus(
		@Args('orderId', { type: () => Int }) orderId: number,
		@Args('status', { type: () => OrderStatus }) status: OrderStatus,
		@CurrentUser() user: User,
		@CurrentVendor() vendor?: Vendor
	) {
		return this.orderService.updateStatus(orderId, status, user.id, vendor?.id);
	}
}
