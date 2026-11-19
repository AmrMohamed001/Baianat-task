import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { Transaction } from './transaction.entity';
import { WalletService } from './wallet.service';
import { WalletResolver } from './wallet.resolver';

@Module({
	imports: [TypeOrmModule.forFeature([Wallet, Transaction])],
	providers: [WalletService, WalletResolver],
	exports: [WalletService],
})
export class WalletModule {}
