import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { usePrepareDataProvider } from './utils';
import { TopicModel } from '@/api/topic';
import { zip } from 'lodash-es';

export const useVisualizationCompareSubdatasetWordsDataProvider: BaseVisualizationDataProviderHook<
  TopicModel,
  object
> = function (item) {
  const { groups: rawGroups, params } = usePrepareDataProvider(item);
  // Exclude default subdataset
  const groups = rawGroups.filter((group) => !!group.filter);
  const { data, error, isFetching, refetch } = client.useQuery(
    'post',
    '/table/{project_id}/compare/words',
    {
      body: {
        column: item.column,
        groups: groups,
      },
      params,
    },
  );

  return {
    data: zip(groups, data?.data.topics ?? []).map((value) => {
      return {
        data: value[1]!,
        name: value[0]!.name,
      };
    }),
    error: error?.message,
    loading: isFetching,
    refetch,
  };
};
