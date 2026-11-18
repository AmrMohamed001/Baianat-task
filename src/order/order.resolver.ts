import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { MyOrdersArgs } from './dtos/my-orders.args';
import { CheckoutArgs } from './dtos/checkout.args';
import { CheckoutResult } from './dtos/checkout-result.type';
import { VendorOrdersArgs } from './dtos/vendor-orders.args';
import { AdminOrdersArgs } from './dtos/admin-orders.args';
import { PaginatedOrders } from './dtos/paginated-orders.type';
import { I18nService } from 'nestjs-i18n';
import { OrderService } from './order.service';
import { Checkout } from './entities/checkout.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { VerifiedVendor } from '../vendor/decorators/verified-vendor.decorator';
import { CurrentVendor } from '../vendor/decorators/current-vendor.decorator';
import { Vendor } from '../vendor/vendor.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';
import { OrderHistoryLoader } from '../dataloader/order-history.loader';
import { OrderItemLoader } from '../dataloader/order-item.loader';
import { OrderItem } from './entities/order-item.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { OrderStatusHistory } from './entities/order-status-history.entity';

@Resolver(() => Order)
export class OrderResolver {
	constructor(
		private readonly orderService: OrderService,
		private readonly historyLoader: OrderHistoryLoader,
		private readonly itemLoader: OrderItemLoader,
		private readonly i18n: I18nService
	) {}

	@Roles(UserRole.Client)
	@Mutation(() => CheckoutResult)
	checkout(@Args() args: CheckoutArgs, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.orderService.checkout(user.id, args.shippingAddress);
	}

	@Roles(UserRole.Client)
	@Query(() => PaginatedOrders)
	myOrders(@Args() args: MyOrdersArgs, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.orderService.myOrders(args, user.id);
	}

	@Roles(UserRole.Client)
	@Query(() => Order)
	order(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.orderService.findOne(id, user.id);
	}

	@Roles(UserRole.Client)
	@Mutation(() => Order)
	cancelOrder(@Args('orderId', { type: () => Int }) orderId: number, @CurrentUser() user: User) {
		if (user.role !== UserRole.Client) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.orderService.cancelOrder(orderId, user.id);
	}

	@Roles(UserRole.SuperAdmin)
	@Query(() => PaginatedOrders)
	adminOrders(@Args() args: AdminOrdersArgs) {
		return this.orderService.adminOrders(args);
	}

	@VerifiedVendor()
	@Query(() => PaginatedOrders)
	vendorOrders(@Args() args: VendorOrdersArgs, @CurrentVendor() vendor: Vendor) {
		if (!vendor) throw new ForbiddenException(this.i18n.t('exceptions.FORBIDDEN'));
		return this.orderService.vendorOrders(args, vendor.id);
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

	@ResolveField(() => [OrderItem])
	items(@Parent() order: Order) {
		return this.itemLoader.byOrderId.load(order.id);
	}
	@ResolveField(() => PaymentStatus) 
	paymentStatus(@Parent() order: Order) {
		return order.checkout.status;
	}
	@ResolveField(() => String)
	shippingAddress(@Parent() order: Order) {
		return order.checkout.shippingAddress;
	}

	@ResolveField(() => String, { nullable: true, description: 'only filled in the vendor views' })
	clientName(@Parent() order: Order) {
		return order.checkout?.client?.fullname ?? null;
	}

	@ResolveField(() => [OrderStatusHistory])
	history(@Parent() order: Order) {
		return this.historyLoader.byOrderId.load(order.id);
	}
}
