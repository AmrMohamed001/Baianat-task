import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

const AR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const EN = /[a-zA-Z]/;



export function fullTextSearch<T extends ObjectLiteral>
		(qb: SelectQueryBuilder<T>, text: string) {
	const a = qb.alias;
	const hasAr = AR.test(text);
	const hasEn = EN.test(text);
	const ar_query = `websearch_to_tsquery('simple', :qAr)`;
	const en_query = `websearch_to_tsquery('english', :qEn)`;

	if (hasAr && hasEn) {
		const words = text.split(/\s+/);
		const qAr = words.filter((w) => AR.test(w)).join(' ');
		const qEn = words.filter((w) => !AR.test(w)).join(' ');
		return qb
			.andWhere(`(${a}.searchVectorAr @@ ${ar_query} AND ${a}.searchVectorEn @@ ${en_query})`, { qAr, qEn })
			.addOrderBy(`ts_rank(${a}.searchVectorAr, ${ar_query}) + ts_rank(${a}.searchVectorEn, ${en_query})`, 'DESC');
	}
	if (hasAr) return qb.andWhere(`${a}.searchVectorAr @@ ${ar_query}`, { qAr: text }).addOrderBy(`ts_rank(${a}.searchVectorAr, ${ar_query})`, 'DESC');
	if (hasEn) return qb.andWhere(`${a}.searchVectorEn @@ ${en_query}`, { qEn: text }).addOrderBy(`ts_rank(${a}.searchVectorEn, ${en_query})`, 'DESC');
	// no letters "42" both
	return qb
		.andWhere(`(${a}.searchVectorAr @@ ${ar_query} OR ${a}.searchVectorEn @@ ${en_query})`, { qAr: text, qEn: text })
		.addOrderBy(`GREATEST(ts_rank(${a}.searchVectorAr, ${ar_query}), ts_rank(${a}.searchVectorEn, ${en_query}))`, 'DESC');
}