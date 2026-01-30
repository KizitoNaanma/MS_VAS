import { Filtering, FilterRule, Sorting } from 'src/common';

export const getOrderBy = (sort: Sorting) =>
  sort ? { [sort.property]: sort.direction.toLowerCase() } : {};

export const getWhere = (filter: Filtering) => {
  if (!filter) return {};

  const value = ['in', 'nin'].includes(filter.rule)
    ? filter.value.split(',')
    : filter.value;

  switch (filter.rule) {
    case FilterRule.IS_NULL:
      return { [filter.property]: null };
    case FilterRule.IS_NOT_NULL:
      return { [filter.property]: { not: null } };
    case FilterRule.EQUALS:
      return { [filter.property]: value };
    case FilterRule.NOT_EQUALS:
      return { [filter.property]: { not: value } };
    case FilterRule.GREATER_THAN:
      return { [filter.property]: { gt: value } };
    case FilterRule.GREATER_THAN_OR_EQUALS:
      return { [filter.property]: { gte: value } };
    case FilterRule.LESS_THAN:
      return { [filter.property]: { lt: value } };
    case FilterRule.LESS_THAN_OR_EQUALS:
      return { [filter.property]: { lte: value } };
    case FilterRule.LIKE:
      return { [filter.property]: { contains: value, mode: 'insensitive' } };
    case FilterRule.NOT_LIKE:
      return {
        [filter.property]: { not: { contains: value }, mode: 'insensitive' },
      };
    case FilterRule.IN:
      return { [filter.property]: { in: value } };
    case FilterRule.NOT_IN:
      return { [filter.property]: { notIn: value } };
    default:
      return {};
  }
};
