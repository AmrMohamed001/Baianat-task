import { PaginationArgs } from '../query/types/pagination.args';

export async function paginate(qb: any,{ page, limit }: PaginationArgs)
{
	const [data, total] = await qb.offset((page - 1) * limit).limit(limit).getManyAndCount();
	return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
