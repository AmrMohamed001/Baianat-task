import { registerEnumType } from '@nestjs/graphql';

export enum WalletType {
	Vendor = 'Vendor',
	Platform = 'Platform',
}

registerEnumType(WalletType, { name: 'WalletType' });
