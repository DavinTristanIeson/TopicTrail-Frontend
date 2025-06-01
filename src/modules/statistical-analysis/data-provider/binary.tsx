import {
  BinaryStatisticTestOnContingencyTableMainResultModel,
  BinaryStatisticTestOnDistributionResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticalAnalysisDataProviderHook } from '../types';
import { client } from '@/common/api/client';
import {
  usePrepareStatisticalAnalysisDataProvider,
  useStatisticalAnalysisDataProviderParams,
} from './utils';
import {
  BinaryContingencyTableConfig,
  BinaryStatisticTestConfig,
} from '../configuration/binary-statistic-test';

export const useBinaryStatisticTestOnDistributionDataProvider: BaseStatisticalAnalysisDataProviderHook<
  BinaryStatisticTestOnDistributionResultModel,
  BinaryStatisticTestConfig
> = function (config) {
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: null,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/binary-test-distribution',
    {
      body: {
        column: config.column,
        groups: subdatasets,
        effect_size_preference: config.effect_size_preference,
        statistic_test_preference: config.statistic_test_preference,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};

export const useBinaryStatisticTestOnContingencyTableDataProvider: BaseStatisticalAnalysisDataProviderHook<
  BinaryStatisticTestOnContingencyTableMainResultModel,
  BinaryContingencyTableConfig
> = function (config) {
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: null,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/binary-test-contingency-table',
    {
      body: {
        column: config.column,
        groups: subdatasets,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};
