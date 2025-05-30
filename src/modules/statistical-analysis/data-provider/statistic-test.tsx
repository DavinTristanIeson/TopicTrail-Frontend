import {
  PairwiseStatisticTestResultModel,
  StatisticTestResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticTestDataProviderHook } from '../types';
import { client } from '@/common/api/client';
import {
  usePrepareStatisticTestDataProvider,
  useStatisticTestDataProviderParams,
} from './utils';
import React from 'react';
import {
  TwoSampleStatisticTestConfig,
  OmnibusStatisticTestConfig,
} from '../configuration/statistic-test';

export const useTwoSampleStatisticTestDataProvider: BaseStatisticTestDataProviderHook<
  StatisticTestResultModel,
  TwoSampleStatisticTestConfig
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: React.useMemo(
      () => [config.group1, config.group2],
      [config.group1, config.group2],
    ),
  });
  const query = client.useQuery('post', '/statistical-analysis/{project_id}', {
    body: {
      column: config.column,
      effect_size_preference: config.effect_size_preference,
      group1: subdatasets[0]!,
      group2: subdatasets[1]!,
      statistic_test_preference: config.statistic_test_preference,
      exclude_overlapping_rows: config.exclude_overlapping_rows,
    },
    params,
  });
  return usePrepareStatisticTestDataProvider({ query });
};

export const usePairwiseTwoSampleStatisticTestDataProvider: BaseStatisticTestDataProviderHook<
  PairwiseStatisticTestResultModel,
  TwoSampleStatisticTestConfig
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
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
  );
  return usePrepareStatisticTestDataProvider({ query });
};

export const useOmnibusStatisticTestDataProvider: BaseStatisticTestDataProviderHook<
  StatisticTestResultModel,
  OmnibusStatisticTestConfig
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
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
  );
  return usePrepareStatisticTestDataProvider({ query });
};
