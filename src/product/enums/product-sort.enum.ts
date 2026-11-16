import { registerEnumType } from '@nestjs/graphql';
export enum ProductSortField {createdAt = 'createdAt',price = 'price'}
registerEnumType(ProductSortField, { name: 'ProductSortField' });
