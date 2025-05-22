import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { VisualizationPairedValuesConfigType } from '../configuration/paired-values';
import { VisualizationPairedValuesModel } from '@/api/table';

export const useVisualizationValuesDataProvider: BaseVisualizationDataProviderHook<
  unknown[],
  object
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

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

export const useVisualizationPairedValuesDataProvider: BaseVisualizationDataProviderHook<
  VisualizationPairedValuesModel,
  VisualizationPairedValuesConfigType
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions('post', '/table/{project_id}/column/paired-values', {
        body: {
          column1: item.column,
          column2: item.config.column2,
          filter: group.filter,
        },
        params,
      }),
    ),
  });

  return useAdaptDataProviderQueries({
    queries,
    groups,
    extract(queryData) {
      return queryData.data;
    },
  });
};
