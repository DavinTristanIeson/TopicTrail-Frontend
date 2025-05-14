import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { usePrepareDataProvider } from './utils';

import {
  VisualizationBinaryStatisticTestOnContingencyTableMainModel,
  VisualizationBinaryStatisticTestOnDistributionMainModel,
} from '@/api/correlation';
import { VisualizationBinaryStatisticTestonDistributionConfigType } from '../configuration/test-distribution';

export const useVisualizationBinaryStatisticTestOnDistributionDataProvider: BaseVisualizationDataProviderHook<
  VisualizationBinaryStatisticTestOnDistributionMainModel,
  VisualizationBinaryStatisticTestonDistributionConfigType
> = function (item) {
  const { params } = usePrepareDataProvider(item);

  const query = client.useQuery(
    'post',
    '/table/{project_id}/correlation/binary/test-distribution',
    {
      body: {
        column1: item.column,
        column2: item.config.target,
        effect_size_preference: item.config.effect_size_preference,
        statistic_test_preference: item.config.statistic_test_preference,
        main_statistic_test_preference:
          item.config.main_statistic_test_preference,
      },
      params,
    },
  );

  return {
    data: query.data
      ? [
          {
            name: item.column,
            data: query.data?.data,
          },
        ]
      : [],
    error: query.error?.message,
    loading: query.isFetching,
    refetch: query.refetch,
  };
};

export const useVisualizationBinaryStatisticTestOnContingencyTableDataProvider: BaseVisualizationDataProviderHook<
  VisualizationBinaryStatisticTestOnContingencyTableMainModel,
  VisualizationBinaryStatisticTestonDistributionConfigType
> = function (item) {
  const { params } = usePrepareDataProvider(item);

  const query = client.useQuery(
    'post',
    '/table/{project_id}/correlation/binary/test-contingency-table',
    {
      body: {
        column1: item.column,
        column2: item.config.target,
        effect_size_preference: item.config.effect_size_preference,
        statistic_test_preference: item.config.statistic_test_preference,
      },
      params,
    },
  );

  return {
    data: query.data
      ? [
          {
            name: item.column,
            data: query.data?.data,
          },
        ]
      : [],
    error: query.error?.message,
    loading: query.isFetching,
    refetch: query.refetch,
  };
};
