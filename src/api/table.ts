import { components } from './openapi';

export type OrTableFilterModel = components['schemas']['OrTableFilter-Output'];
export type AndTableFilterModel =
  components['schemas']['AndTableFilter-Output'];
export type NotTableFilterModel =
  components['schemas']['NotTableFilter-Output'];
export type OnlyTableFilterModel = components['schemas']['OnlyTableFilter'];
export type EmptyTableFilterModel = components['schemas']['EmptyTableFilter'];
export type HasTextTableFilter = components['schemas']['HasTextTableFilter'];
export type EqualToTableFilter = components['schemas']['EqualToTableFilter'];
export type IsOneOfTableFilterModel =
  components['schemas']['IsOneOfTableFilter'];
export type LessThanTableFilterModel =
  components['schemas']['LessThanTableFilter'];
export type ExcludesTableFilterModel =
  components['schemas']['ExcludesTableFilter'];
export type IncludesTableFilterModel =
  components['schemas']['IncludesTableFilter'];
export type NotEmptyTableFilterModel =
  components['schemas']['NotEmptyTableFilter'];
export type GreaterThanTableFilterModel =
  components['schemas']['GreaterThanTableFilter'];
export type LessThanOrEqualToTableFilterModel =
  components['schemas']['LessThanOrEqualToTableFilter'];
export type GreaterThanOrEqualToTableFilterModel =
  components['schemas']['GreaterThanOrEqualToTableFilter'];

export type TableFilterModel =
  | OrTableFilterModel
  | AndTableFilterModel
  | NotTableFilterModel
  | OnlyTableFilterModel
  | EmptyTableFilterModel
  | HasTextTableFilter
  | EqualToTableFilter
  | IsOneOfTableFilterModel
  | LessThanTableFilterModel
  | ExcludesTableFilterModel
  | IncludesTableFilterModel
  | NotEmptyTableFilterModel
  | GreaterThanTableFilterModel
  | LessThanOrEqualToTableFilterModel
  | GreaterThanOrEqualToTableFilterModel;

export type TableSortModel = components['schemas']['TableSort'];
export type PaginationMetaModel = components['schemas']['PaginationMeta'];
export type TablePaginationApiResult =
  components['schemas']['TablePaginationApiResult_dict_str__Any__'];

export type DescriptiveStatisticsModel =
  components['schemas']['DescriptiveStatisticsResource'];
