import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { usePrepareDataProvider } from './utils';
import { SubdatasetCooccurrenceModel } from '@/api/comparison';
import React from 'react';

export const useVisualizationSubdatasetCooccurrenceDataProvider: BaseVisualizationDataProviderHook<
  SubdatasetCooccurrenceModel,
  object
> = function (item) {
  const { groups: rawGroups, params } = usePrepareDataProvider(item);
  // Exclude default subdataset
  const groups = rawGroups.filter((group) => !!group.filter);
  const { data, error, isFetching, refetch } = client.useQuery(
    'post',
    '/table/{project_id}/comparison/co-occurrence',
    {
      body: {
        column: item.column,
        groups: groups,
      },
      params,
    },
  );

  const processedData = React.useMemo(() => {
    return data?.data
      ? [
          {
            data: data?.data,
            name: 'Default',
          },
        ]
      : [];
  }, [data?.data]);

  return {
    data: processedData,
    error: error?.message,
    loading: isFetching,
    refetch,
  };
};
