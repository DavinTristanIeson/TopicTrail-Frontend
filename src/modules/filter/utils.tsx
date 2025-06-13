import { TableFilterModel } from '@/api/table';

export function shrinkTableFilter(filter: TableFilterModel): TableFilterModel {
  if (
    (filter.type === 'and' || filter.type === 'or') &&
    filter.operands.length === 1
  ) {
    return filter.operands[0]!;
  }
  return filter;
}
