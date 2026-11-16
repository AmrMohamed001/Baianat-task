import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { SortOrder } from './enums/sort-order.enum';

export function sort<T extends ObjectLiteral>
(qb: SelectQueryBuilder<T>, field: string, order: SortOrder = SortOrder.DESC) {
	return qb.addOrderBy(`${qb.alias}.${field}`, order).addOrderBy(`${qb.alias}.id`, order);
}
