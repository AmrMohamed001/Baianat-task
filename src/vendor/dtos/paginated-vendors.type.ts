import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';
import { Vendor } from '../vendor.entity';

@ObjectType() export class PaginatedVendors extends Paginated(Vendor) {}
