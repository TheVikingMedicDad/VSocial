export const CONTAINER_FIELD_ID = '_AND_OR';

export enum LogicalFilterOperator {
  AND = '_And',
  OR = '_Or',
}

export const FAKE_FILTER_MODEL_NAME = 'FilterType';

export enum TextFilterVariant {
  EXACT = '',
  IEXACT = 'Iexact',
  STARTS_WITH = 'Startswith',
  ISTARTS_WITH = 'Istartswith',
  ENDS_WITH = 'Endswith',
  IENDS_WITH = 'Iendswith',
  CONTAINS = 'Contains',
  ICONTAINS = 'Icontains',
}

export enum NumberFilterVariant {
  EXACT = '',
  LESS_THAN = 'Lt',
  LESS_THAN_EQUAL = 'Lte',
  GREATER_THAN = 'Gt',
  GREATER_THAN_EQUAL = 'Gte',
}

export enum DateFilterVariant {
  EXACT = '',
  LESS_THAN = 'Lt',
  LESS_THAN_EQUAL = 'Lte',
  GREATER_THAN = 'Gt',
  GREATER_THAN_EQUAL = 'Gte',
  YEAR = 'Year',
  MONTH = 'Month',
  DAY = 'Day',
  WEEK = 'Week',
  WEEK_DAY = 'WeekDay',
  QUARTER = 'Quarter',
  HOUR = 'Hour',
  MINUTE = 'Minute',
  SECOND = 'Second',
}

export type AllFilterVariants = TextFilterVariant | DateFilterVariant | NumberFilterVariant;

export const createDefaultTextFilterOptions = () => ({
  filterVariants: [
    TextFilterVariant.ICONTAINS,
    TextFilterVariant.ISTARTS_WITH,
    TextFilterVariant.IENDS_WITH,
    TextFilterVariant.IEXACT,
  ],
});
