import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationArgs } from '../query/types/pagination.args';
import { PaginatedResult } from './interfaces/pagination.interface';

export async function paginate<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>,{ page, limit }: PaginationArgs): Promise<PaginatedResult<T>> 
{
	const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
	return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
