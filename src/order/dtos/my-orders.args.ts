import { ArgsType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationArgs } from '../../common/query/types/pagination.args';
import { OrderStatus } from '../enums/order-status.enum';

@ArgsType()
export class MyOrdersArgs extends PaginationArgs {
	@IsOptional()
	@IsEnum(OrderStatus)
	@Field(() => OrderStatus, { nullable: true })
	status?: OrderStatus;
}
