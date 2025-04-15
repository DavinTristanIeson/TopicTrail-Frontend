import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { TableWordsModel } from '@/api/table';

export const useVisualizationWordFrequenciesDataProvider: BaseVisualizationDataProviderHook<
  TableWordsModel,
  object
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);
  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions(
        'post',
        '/table/{project_id}/column/word-frequencies',
        {
          body: {
            column: item.column,
            filter: group.filter,
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
