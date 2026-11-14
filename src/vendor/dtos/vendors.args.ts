import { ArgsType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationArgs } from '../../common/query/types/pagination.args';
import { VendorStatus } from '../enums/vendor-status.enum';

@ArgsType()
export class VendorsArgs extends PaginationArgs {
	@IsOptional()
	@IsEnum(VendorStatus)
	@Field(() => VendorStatus, { nullable: true })
	status?: VendorStatus;
}
