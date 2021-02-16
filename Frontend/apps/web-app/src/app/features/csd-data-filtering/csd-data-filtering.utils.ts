import { LogicalFilterOperator } from './csd-data-filtering.constants';

export function countFilters(filterQuery: any): number {
  let count = 0;
  if (isEmptyFilterQuery(filterQuery)) {
    return 0;
  }
  const key = Object.keys(filterQuery)[0];
  if (isFieldIdContainer(key)) {
    const childQueries = getChildQueries(filterQuery);
    for (const childQuery of childQueries) {
      count += countFilters(childQuery);
    }
  } else {
    return 1;
  }
  return count;
}

export function isFieldIdContainer(fieldId): boolean {
  return fieldId === LogicalFilterOperator.OR || fieldId === LogicalFilterOperator.AND;
}

export function getOperatorFromFilterQuery(containerQuery) {
  return LogicalFilterOperator.OR in containerQuery
    ? LogicalFilterOperator.OR
    : LogicalFilterOperator.AND;
}

export function getChildQueries(containerQuery): any[] {
  const operator = getOperatorFromFilterQuery(containerQuery);
  if (!operator || !containerQuery) {
    return [];
  }
  if (!(operator in containerQuery)) {
    return [];
  }
  return containerQuery[operator];
}

export function isEmptyFilterQuery(filterQuery: any): boolean {
  return Object.keys(filterQuery).length === 0;
}
