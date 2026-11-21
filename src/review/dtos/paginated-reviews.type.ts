import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/query/types/paginated.type';
import { Review } from '../review.entity';

@ObjectType() export class PaginatedReviews extends Paginated(Review) {}
