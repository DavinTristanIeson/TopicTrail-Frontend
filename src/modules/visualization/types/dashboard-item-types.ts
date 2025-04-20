import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { AllTopicModelingResultContext } from '@/modules/topics/components/context';
import React from 'react';

export enum DashboardItemTypeEnum {
  DescriptiveStatistics = 'descriptive-statistics',
  Counts = 'counts',
  FrequencyDistribution = 'frequency-distribution',
  DataDistribution = 'data-distribution',
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
    DashboardItemTypeEnum.DataDistribution,
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
  [SchemaColumnTypeEnum.Temporal]: [
    ...FOR_ALL_TYPES,
    ...FOR_CATEGORICAL_TYPES,
    DashboardItemTypeEnum.Calendar,
    DashboardItemTypeEnum.DataDistribution,
  ],
  [SchemaColumnTypeEnum.Textual]: [
    ...FOR_ALL_TYPES,
    DashboardItemTypeEnum.SubdatasetWords,
    DashboardItemTypeEnum.WordFrequencies,
    DashboardItemTypeEnum.TopicWords,
  ],
  [SchemaColumnTypeEnum.Topic]: [...FOR_ALL_TYPES, ...FOR_CATEGORICAL_TYPES],
  [SchemaColumnTypeEnum.Unique]: [],
};

export const ALLOWED_DASHBOARD_ITEM_COLUMNS: SchemaColumnTypeEnum[] =
  Object.entries(SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN)
    .filter((item) => item[1].length > 0)
    .map((item) => item[0] as SchemaColumnTypeEnum);

export function useAllowedDashboardItemTypes() {
  const allTopicModelingResults = React.useContext(
    AllTopicModelingResultContext,
  );
  return React.useCallback(
    (column: SchemaColumnModel) => {
      const defaultColumns =
        SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN[column.type];
      if (
        column.type === SchemaColumnTypeEnum.Textual ||
        column.type === SchemaColumnTypeEnum.Topic
      ) {
        const columnName =
          column.type === SchemaColumnTypeEnum.Textual
            ? column.name
            : column.source_name!;
        const topicModelingResult = allTopicModelingResults.find(
          (topicModelingResult) =>
            topicModelingResult.column.name === columnName,
        );
        if (!topicModelingResult?.result) {
          return [];
        }
        return defaultColumns;
      }
      return defaultColumns;
    },
    [allTopicModelingResults],
  );
}
