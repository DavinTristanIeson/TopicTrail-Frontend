import { SchemaColumnTypeEnum } from '@/common/constants/enum';

export enum DashboardItemTypeEnum {
  DescriptiveStatistics = 'descriptive-statistics',
  Counts = 'counts',
  FrequencyDistribution = 'frequency-distribution',
  ContinuousDataDistribution = 'continuous-data-distribution',
  Aggregate = 'aggregate',
  GeographicalCoordinates = 'geographical-coordinates',
  Calendar = 'calendar',
  WordFrequencies = 'word-frequencies',
  TopicWords = 'topic-words',
  SubdatasetWords = 'subdataset-words',

  ContingencyTable = 'contingency-table',
  StatisticTestContingencyTable = 'statistic-test-contingency-table',
  StatisticTestDistribution = 'binary-significance-on-distribution',
}

const FOR_ALL_TYPES = [DashboardItemTypeEnum.Counts];
const FOR_CATEGORICAL_TYPES = [
  DashboardItemTypeEnum.FrequencyDistribution,
  DashboardItemTypeEnum.ContingencyTable,
  DashboardItemTypeEnum.StatisticTestContingencyTable,
  DashboardItemTypeEnum.StatisticTestDistribution,
];

export const SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN: Record<
  SchemaColumnTypeEnum,
  DashboardItemTypeEnum[]
> = {
  [SchemaColumnTypeEnum.Categorical]: [
    ...FOR_ALL_TYPES,
    ...FOR_CATEGORICAL_TYPES,
  ],
  [SchemaColumnTypeEnum.Continuous]: [
    ...FOR_ALL_TYPES,
    DashboardItemTypeEnum.DescriptiveStatistics,
    DashboardItemTypeEnum.ContinuousDataDistribution,
    DashboardItemTypeEnum.Aggregate,
  ],
  [SchemaColumnTypeEnum.Geospatial]: [
    ...FOR_ALL_TYPES,
    DashboardItemTypeEnum.GeographicalCoordinates,
  ],
  [SchemaColumnTypeEnum.OrderedCategorical]: [
    ...FOR_ALL_TYPES,
    ...FOR_CATEGORICAL_TYPES,
  ],
  [SchemaColumnTypeEnum.Temporal]: [...FOR_ALL_TYPES, ...FOR_CATEGORICAL_TYPES],
  [SchemaColumnTypeEnum.Textual]: [
    ...FOR_ALL_TYPES,
    DashboardItemTypeEnum.SubdatasetWords,
  ],
  [SchemaColumnTypeEnum.Topic]: [
    ...FOR_ALL_TYPES,
    ...FOR_CATEGORICAL_TYPES,
    DashboardItemTypeEnum.TopicWords,
  ],
  [SchemaColumnTypeEnum.Unique]: [],
};

export const ALLOWED_DASHBOARD_ITEM_COLUMNS: SchemaColumnTypeEnum[] =
  Object.entries(SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN)
    .filter((item) => item[1].length > 0)
    .map((item) => item[0] as SchemaColumnTypeEnum);
