import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { TopicModel } from '@/api/topic';

export const useVisualizationTopicWordsDataProvider: BaseVisualizationDataProviderHook<
  TopicModel[],
  object
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);
  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions('post', '/table/{project_id}/column/topic-words', {
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
      return data.data.topics;
    },
  });
};
