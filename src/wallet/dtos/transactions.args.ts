import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationArgs } from '../../common/query/types/pagination.args';
import { TransactionType } from '../enums/transaction-type.enum';

@ArgsType()
export class TransactionsArgs extends PaginationArgs {
	@IsOptional()
	@IsEnum(TransactionType)
	@Field(() => TransactionType, { nullable: true })
	type?: TransactionType;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true, description: 'transactions of this vendor wallet' })
	vendorId?: number;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	orderId?: number;

	@IsOptional()
	@IsDate()
	@Field(() => Date, { nullable: true })
	from?: Date;

	@IsOptional()
	@IsDate()
	@Field(() => Date, { nullable: true })
	to?: Date;
}
