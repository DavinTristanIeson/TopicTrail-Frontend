import {
  PairwiseStatisticTestResultModel,
  StatisticTestResultModel,
} from '@/api/statistic-test';
import { TwoSampleStatisticTestConfig } from '../configuration/two-sample';
import { BaseStatisticTestDataProviderHook } from '../types';
import { client } from '@/common/api/client';
import {
  usePrepareStatisticTestDataProvider,
  useStatisticTestDataProviderParams,
} from './utils';
import React from 'react';

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
  const query = client.useQuery('post', '/statistic-test/{project_id}', {
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
    '/statistic-test/{project_id}/pairwise',
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
