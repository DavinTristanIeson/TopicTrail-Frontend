import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { VisualizationAggregateValuesModel } from '@/api/table';

import { VisualizationAggregateValuesConfigType } from '../configuration/aggregate-values';

export const useVisualizationAggregatedTotalsDataProvider: BaseVisualizationDataProviderHook<
  VisualizationAggregateValuesModel,
  VisualizationAggregateValuesConfigType
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

  const config = item.config;

  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions(
        'post',
        '/table/{project_id}/column/aggregate-values',
        {
          body: {
            column: item.column,
            filter: group.filter,
            grouped_by: config.grouped_by,
            method: config.method,
          },
          params,
        },
      ),
    ),
  });

  return useAdaptDataProviderQueries({
    queries,
    groups,
    extract: (data) => {
      return data.data;
    },
  });
};
