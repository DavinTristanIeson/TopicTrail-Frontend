import {
  BinaryStatisticTestOnContingencyTableMainResultModel,
  BinaryStatisticTestOnDistributionResultModel,
} from '@/api/statistic-test';
import { BaseStatisticTestDataProviderHook } from '../types';
import { client } from '@/common/api/client';
import {
  usePrepareStatisticTestDataProvider,
  useStatisticTestDataProviderParams,
} from './utils';
import { BinaryStatisticTestConfig } from '../configuration/binary';
import { ContingencyTableConfig } from '../configuration/contingency-table';

export const useBinaryStatisticTestOnDistributionDataProvider: BaseStatisticTestDataProviderHook<
  BinaryStatisticTestOnDistributionResultModel,
  BinaryStatisticTestConfig
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistic-test/{project_id}/binary-test-distribution',
    {
      body: {
        column: config.column,
        groups: subdatasets,
        effect_size_preference: config.effect_size_preference,
        statistic_test_preference: config.statistic_test_preference,
      },
      params,
    },
  );
  return usePrepareStatisticTestDataProvider({ query });
};

export const useBinaryStatisticTestOnContingencyTableDataProvider: BaseStatisticTestDataProviderHook<
  BinaryStatisticTestOnContingencyTableMainResultModel,
  ContingencyTableConfig
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistic-test/{project_id}/binary-test-contingency-table',
    {
      body: {
        column: config.column,
        groups: subdatasets,
      },
      params,
    },
  );
  return usePrepareStatisticTestDataProvider({ query });
};
