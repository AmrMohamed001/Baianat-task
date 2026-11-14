import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';
import { User } from '../user.entity';

@ObjectType() export class PaginatedUsers extends Paginated(User) {}
