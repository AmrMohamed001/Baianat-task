import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationArgs } from '../../common/query/types/pagination.args';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

@ArgsType()
export class AdminOrdersArgs extends PaginationArgs {
	@IsOptional()
	@IsEnum(OrderStatus)
	@Field(() => OrderStatus, { nullable: true })
	status?: OrderStatus;

	@IsOptional()
	@IsEnum(PaymentStatus)
	@Field(() => PaymentStatus, { nullable: true })
	paymentStatus?: PaymentStatus;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	vendorId?: number;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	clientId?: number;

	@IsOptional()
	@IsDate()
	@Field(() => Date, { nullable: true })
	from?: Date;

	@IsOptional()
	@IsDate()
	@Field(() => Date, { nullable: true })
	to?: Date;
}
