import { TableFilterTypeEnum } from '@/common/constants/enum';

export interface BaseTableFilter {
  type: TableFilterTypeEnum;
}

export interface AndTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.And;
  operands: BaseTableFilter[];
}

export interface OrTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.Or;
  operands: BaseTableFilter[];
}

export interface NotTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.Not;
  operand: BaseTableFilter;
}

export interface EmptyTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.Empty;
}

export interface NotEmptyTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.NotEmpty;
}

export interface EqualToTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.EqualTo;
  value: string | number;
}

export interface IsOneOfTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.IsOneOf;
  values: (string | number)[];
}

export interface GreaterThanTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.GreaterThan;
  value: string | number;
}

export interface LessThanTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.LessThan;
  value: string | number;
}

export interface GreaterThanOrEqualToTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.GreaterThanOrEqualTo;
  value: string | number;
}

export interface LessThanOrEqualToTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.LessThanOrEqualTo;
  value: string | number;
}

export interface HasTextTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.HasText;
  value: string;
}

export interface IncludesTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.Includes;
  values: string[];
}

export interface ExcludesTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.Excludes;
  values: string[];
}

export interface OnlyTableFilter extends BaseTableFilter {
  type: TableFilterTypeEnum.Only;
  values: string[];
}

export type GeneralCaseTableFilter =
  | EmptyTableFilter
  | NotEmptyTableFilter
  | EqualToTableFilter
  | IsOneOfTableFilter;
export type CompoundTableFilter =
  | AndTableFilter
  | OrTableFilter
  | NotTableFilter;
export type OrderedTableFilter =
  | GreaterThanTableFilter
  | LessThanTableFilter
  | GreaterThanOrEqualToTableFilter
  | LessThanOrEqualToTableFilter;
export type MultiCategoricalTableFilter =
  | IncludesTableFilter
  | ExcludesTableFilter
  | OnlyTableFilter;
export type TextualTableFilter = HasTextTableFilter;

export type TableFilter =
  | GeneralCaseTableFilter
  | CompoundTableFilter
  | OrderedTableFilter
  | MultiCategoricalTableFilter
  | TextualTableFilter;

export class NamedTableFilter {
  name: string;
  filter: TableFilter;
}
