import { Injectable } from '@nestjs/common';
import { SortOrder } from './enums/sort-order.enum';
import { PaginationArgs } from './types/pagination.args';

const AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const EN = /[a-zA-Z]/;

@Injectable()
export class QueryService {
	search(qb: any, text: string) {
		const hasAr = AR.test(text);
		const hasEn = EN.test(text);
		const ar_query = `websearch_to_tsquery('simple', :qAr)`;
		const en_query = `websearch_to_tsquery('english', :qEn)`;

		if (hasAr && hasEn) {
			const words = text.split(/\s+/);
			const qAr = words.filter((w) => AR.test(w)).join(' ');
			const qEn = words.filter((w) => !AR.test(w)).join(' ');
			return qb
				.andWhere(`(${qb.alias}.searchVectorAr @@ ${ar_query} AND ${qb.alias}.searchVectorEn @@ ${en_query})`, { qAr, qEn })
				.addOrderBy(`ts_rank(${qb.alias}.searchVectorAr, ${ar_query}) + ts_rank(${qb.alias}.searchVectorEn, ${en_query})`, 'DESC');
		}
		if (hasAr) return qb.andWhere(`${qb.alias}.searchVectorAr @@ ${ar_query}`, { qAr: text }).addOrderBy(`ts_rank(${qb.alias}.searchVectorAr, ${ar_query})`, 'DESC');
		if (hasEn) return qb.andWhere(`${qb.alias}.searchVectorEn @@ ${en_query}`, { qEn: text }).addOrderBy(`ts_rank(${qb.alias}.searchVectorEn, ${en_query})`, 'DESC');
		// no letters "42" both
		return qb
			.andWhere(`(${qb.alias}.searchVectorAr @@ ${ar_query} OR ${qb.alias}.searchVectorEn @@ ${en_query})`, { qAr: text, qEn: text })
			.addOrderBy(`greatest(ts_rank(${qb.alias}.searchVectorAr, ${ar_query}), ts_rank(${qb.alias}.searchVectorEn, ${en_query}))`, 'DESC');
	}

	sort(qb: any, field: string, order: SortOrder = SortOrder.DESC) {
		return qb.addOrderBy(`${qb.alias}.${field}`, order).addOrderBy(`${qb.alias}.id`, order);
	}

	paginate(qb: any, { page, limit }: PaginationArgs) {
		return qb.offset((page - 1) * limit).limit(limit);
	}

	async getPage(qb: any, args: PaginationArgs) {
		const [data, total] = await qb.getManyAndCount();
		return { data, total, page: args.page, limit: args.limit, totalPages: Math.ceil(total / args.limit) };
	}
}
