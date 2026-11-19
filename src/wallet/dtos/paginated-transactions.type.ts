import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';
import { Transaction } from '../transaction.entity';

@ObjectType() export class PaginatedTransactions extends Paginated(Transaction) {}
