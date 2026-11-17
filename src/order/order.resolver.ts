import { ForbiddenException } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { OrderService } from './order.service';
import { Checkout } from './checkout.entity';
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
}
