import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { PaginatedTransactions } from './dtos/paginated-transactions.type';
import { VerifiedVendor } from '../vendor/decorators/verified-vendor.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PayoutVendorArgs } from './dtos/payout-vendor.args';
import { Transaction } from './transaction.entity';
import { TransactionsArgs } from './dtos/transactions.args';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';

@Resolver(() => Wallet)
export class WalletResolver {
	constructor(private readonly walletService: WalletService) {}

	@VerifiedVendor()
	@Query(() => Wallet)
	myWallet(@CurrentUser() user: User) {
		return this.walletService.findByUser(user.id);
	}

	@Roles(UserRole.SuperAdmin)
	@Query(() => Wallet)
	wallet(@Args('userId', { type: () => Int }) userId: number) {
		return this.walletService.findByUser(userId);
	}

	@Roles(UserRole.SuperAdmin)
	@Query(() => PaginatedTransactions)
	allTransactions(@Args() args: TransactionsArgs) {
		return this.walletService.allTransactions(args);
	}

	@Roles(UserRole.SuperAdmin)
	@Mutation(() => Transaction)
	payoutVendor(@Args() args: PayoutVendorArgs, @CurrentUser() admin: User) {
		return this.walletService.payoutVendor(args.vendorId, args.amount, admin.id);
	}

	@ResolveField(() => PaginatedTransactions)
	transactions(@Parent() wallet: Wallet, @Args() args: PaginationArgs) {
		return this.walletService.transactions(wallet.id, args);
	}
}
