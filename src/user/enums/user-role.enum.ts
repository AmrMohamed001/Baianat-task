import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
	SuperAdmin = 'Super Admin',
	Client = 'Client',
	Vendor = 'Vendor',
}

registerEnumType(UserRole, { name: 'UserRole' });
