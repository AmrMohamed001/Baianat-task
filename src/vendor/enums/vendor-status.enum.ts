import { registerEnumType } from '@nestjs/graphql';

export enum VendorStatus {
	Pending = 'Pending',
	Verified = 'Verified',
	Rejected = 'Rejected',
}

registerEnumType(VendorStatus, { name: 'VendorStatus' });
