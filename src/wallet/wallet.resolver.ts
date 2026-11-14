import { Query, Resolver } from '@nestjs/graphql';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { VerifiedVendor } from '../vendor/decorators/verified-vendor.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';

@Resolver(() => Wallet)
export class WalletResolver {
	constructor(private readonly walletService: WalletService) {}

	@VerifiedVendor()
	@Query(() => Wallet)
	myWallet(@CurrentUser() user: User) {
		return this.walletService.findByUser(user.id);
	}
}
