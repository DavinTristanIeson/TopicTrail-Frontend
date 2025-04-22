import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { usePrepareDataProvider } from './utils';

import {
  VisualizationBinaryStatisticTestOnContingencyTableModel,
  VisualizationBinaryStatisticTestOnDistributionModel,
} from '@/api/correlation';
import { VisualizationBinaryStatisticTestConfigType } from '../configuration/binary-statistic-test';

export const useVisualizationBinaryStatisticTestOnDistributionDataProvider: BaseVisualizationDataProviderHook<
  VisualizationBinaryStatisticTestOnDistributionModel[],
  VisualizationBinaryStatisticTestConfigType
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
      },
      params,
    },
  );

  return {
    data: query.data
      ? [
          {
            name: 'Default',
            data: query.data?.data,
          },
        ]
      : [],
    error: query.error?.message,
    loading: query.isFetching,
  };
};

export const useVisualizationBinaryStatisticTestOnContingencyTableDataProvider: BaseVisualizationDataProviderHook<
  VisualizationBinaryStatisticTestOnContingencyTableModel[],
  VisualizationBinaryStatisticTestConfigType
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
            name: 'Default',
            data: query.data?.data,
          },
        ]
      : [],
    error: query.error?.message,
    loading: query.isFetching,
  };
};
