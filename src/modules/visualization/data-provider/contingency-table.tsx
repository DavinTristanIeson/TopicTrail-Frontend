import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { usePrepareDataProvider } from './utils';

import { VisualizationContingencyTableConfigType } from '../configuration/contingency-table';
import { VisualizationContingencyTableModel } from '@/api/correlation';

export const useVisualizationContingencyTableDataProvider: BaseVisualizationDataProviderHook<
  VisualizationContingencyTableModel,
  VisualizationContingencyTableConfigType
> = function (item) {
  const { params } = usePrepareDataProvider(item);

  const query = client.useQuery(
    'post',
    '/table/{project_id}/correlation/contingency-table',
    {
      body: {
        column1: item.column,
        column2: item.config.target,
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
