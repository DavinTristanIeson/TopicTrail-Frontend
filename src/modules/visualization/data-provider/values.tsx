import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';

export const useVisualizationValuesDataProvider: BaseVisualizationDataProviderHook<
  unknown[],
  object
> = function (item) {
  const { groups, column, params } = usePrepareDataProvider(item);

  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions('post', '/table/{project_id}/column/values', {
        body: {
          column: item.column,
          filter: group.filter,
        },
        params,
      }),
    ),
  });

  return useAdaptDataProviderQueries({
    queries,
    groups,
    extract: (data) => {
      return data.data.values;
    },
  });
};
