import { SchemaColumnTypeEnum } from '@/common/constants/enum';

export enum DashboardItemTypeEnum {
  DescriptiveStatistics = 'descriptive-statistics',
}

export const SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN: Record<
  SchemaColumnTypeEnum,
  DashboardItemTypeEnum[]
> = {
  [SchemaColumnTypeEnum.Categorical]: [],
  [SchemaColumnTypeEnum.Continuous]: [],
  [SchemaColumnTypeEnum.Geospatial]: [],
  [SchemaColumnTypeEnum.MultiCategorical]: [],
  [SchemaColumnTypeEnum.OrderedCategorical]: [],
  [SchemaColumnTypeEnum.Temporal]: [],
  [SchemaColumnTypeEnum.Textual]: [],
  [SchemaColumnTypeEnum.Topic]: [],
  [SchemaColumnTypeEnum.Unique]: [],
};

export const ALLOWED_DASHBOARD_ITEM_COLUMNS: SchemaColumnTypeEnum[] =
  Object.entries(SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN)
    .filter((item) => item[1].length > 0)
    .map((item) => item[0] as SchemaColumnTypeEnum);
