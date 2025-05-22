import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import React from 'react';
import { DashboardConstraintContext } from './context';
import { useContextSelector } from 'use-context-selector';
import { intersection, without } from 'lodash-es';

export enum DashboardItemTypeEnum {
  DescriptiveStatistics = 'descriptive-statistics',
  Counts = 'counts',
  FrequencyDistribution = 'frequency-distribution',
  Proportions = 'proportions',
  DataDistribution = 'data-distribution',
  Aggregate = 'aggregate',
  GeographicalFrequencies = 'geographical-frequencies',
  GeographicalAggregate = 'geographical-aggregate',
  Calendar = 'calendar',
  WordFrequencies = 'word-frequencies',
  TopicWords = 'topic-words',
  PairedValues = 'paired-values',

  SubdatasetWords = 'subdataset-words',
  SubdatasetCooccurrence = 'subdataset-cooccurrence',
}

const FOR_ALL_TYPES = [
  DashboardItemTypeEnum.Counts,
  DashboardItemTypeEnum.SubdatasetCooccurrence,
];
const FOR_CATEGORICAL_TYPES = [
  DashboardItemTypeEnum.FrequencyDistribution,
  DashboardItemTypeEnum.Proportions,
  DashboardItemTypeEnum.PairedValues,
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
    DashboardItemTypeEnum.PairedValues,
    DashboardItemTypeEnum.DescriptiveStatistics,
    DashboardItemTypeEnum.DataDistribution,
    DashboardItemTypeEnum.Aggregate,
    DashboardItemTypeEnum.GeographicalAggregate,
  ],
  [SchemaColumnTypeEnum.Geospatial]: [
    ...FOR_ALL_TYPES,
    DashboardItemTypeEnum.GeographicalFrequencies,
  ],
  [SchemaColumnTypeEnum.OrderedCategorical]: [
    ...FOR_ALL_TYPES,
    ...FOR_CATEGORICAL_TYPES,
  ],
  [SchemaColumnTypeEnum.Boolean]: [...FOR_ALL_TYPES, ...FOR_CATEGORICAL_TYPES],
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

export function useAllowedDashboardItemTypes() {
  const allowedTypes = useContextSelector(
    DashboardConstraintContext,
    (store) => store.allowedTypes,
  );
  const withoutTypes = useContextSelector(
    DashboardConstraintContext,
    (store) => store.withoutTypes,
  );
  return React.useCallback(
    (column: SchemaColumnModel) => {
      const defaultDashboardTypes =
        SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN[column.type];
      const dashboardTypes = allowedTypes
        ? intersection(allowedTypes, defaultDashboardTypes)
        : withoutTypes
          ? without(defaultDashboardTypes, ...withoutTypes)
          : defaultDashboardTypes;
      return dashboardTypes;
    },
    [allowedTypes, withoutTypes],
  );
}
