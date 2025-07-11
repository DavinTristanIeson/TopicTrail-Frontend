import {
  PairwiseStatisticTestResultModel,
  StatisticTestResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticalAnalysisDataProviderHook } from '../types';
import { client } from '@/common/api/client';
import {
  usePrepareStatisticalAnalysisDataProvider,
  useStatisticalAnalysisDataProviderParams,
} from './utils';
import React from 'react';
import {
  TwoSampleStatisticTestConfig,
  OmnibusStatisticTestConfig,
} from '../configuration/statistic-test';

export const useTwoSampleStatisticTestDataProvider: BaseStatisticalAnalysisDataProviderHook<
  StatisticTestResultModel,
  TwoSampleStatisticTestConfig
> = function (options) {
  const { config } = options;
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: React.useMemo(
        () => [config.group1, config.group2],
        [config.group1, config.group2],
      ),
      options: options,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}',
    {
      body: {
        column: config.column,
        effect_size_preference: config.effect_size_preference,
        group1: subdatasets[0]!,
        group2: subdatasets[1]!,
        statistic_test_preference: config.statistic_test_preference,
        exclude_overlapping_rows: config.exclude_overlapping_rows,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};

export const usePairwiseTwoSampleStatisticTestDataProvider: BaseStatisticalAnalysisDataProviderHook<
  PairwiseStatisticTestResultModel,
  TwoSampleStatisticTestConfig
> = function (options) {
  const { config } = options;
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: null,
      options: options,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/pairwise',
    {
      body: {
        column: config.column,
        groups: subdatasets,
        effect_size_preference: config.effect_size_preference,
        statistic_test_preference: config.statistic_test_preference,
        exclude_overlapping_rows: config.exclude_overlapping_rows,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};

export const useOmnibusStatisticTestDataProvider: BaseStatisticalAnalysisDataProviderHook<
  StatisticTestResultModel,
  OmnibusStatisticTestConfig
> = function (options) {
  const { config } = options;
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: null,
      options: options,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/omnibus',
    {
      body: {
        column: config.column,
        groups: subdatasets,
        statistic_test_preference: config.statistic_test_preference,
        exclude_overlapping_rows: config.exclude_overlapping_rows,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};
