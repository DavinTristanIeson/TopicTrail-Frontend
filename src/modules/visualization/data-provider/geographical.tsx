import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { VisualizationGeographicalPointsModel } from '@/api/table';

import * as Yup from 'yup';

const VisualizationGeographicalPointsDataProviderConfigSchema = Yup.object({
  column2: Yup.string().required(),
});

export type VisualizationGeographicalPointsDataProviderConfigType =
  Yup.InferType<typeof VisualizationGeographicalPointsDataProviderConfigSchema>;

export const useVisualizationGeographicalPointsDataProvider: BaseVisualizationDataProviderHook<
  VisualizationGeographicalPointsModel,
  VisualizationGeographicalPointsDataProviderConfigType
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

  const config = item.config;

  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions('post', '/table/{project_id}/column/geographical', {
        body: {
          latitude_column: item.column,
          longitude_column: config.column2,
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
      return data.data;
    },
  });
};
