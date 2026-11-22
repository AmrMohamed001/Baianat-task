import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationArgs } from '../query/types/pagination.args';

export async function paginate<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>,{ page, limit }: PaginationArgs)
{
	const [data, total] = await qb.offset((page - 1) * limit).limit(limit).getManyAndCount();
	return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
