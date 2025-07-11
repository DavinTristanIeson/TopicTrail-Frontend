import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { VisualizationGeographicalPointsModel } from '@/api/table';
import {
  VisualizationGeographicalAggregateValuesConfigType,
  VisualizationGeographicalFrequenciesConfigType,
} from '../configuration/geographical-points';

export const useVisualizationGeographicalFrequenciesDataProvider: BaseVisualizationDataProviderHook<
  VisualizationGeographicalPointsModel,
  VisualizationGeographicalFrequenciesConfigType
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

  const config = item.config;

  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions('post', '/table/{project_id}/column/geographical', {
        body: {
          latitude_column: config.latitude_column,
          longitude_column: config.longitude_column,
          label_column: config.label_column ?? null,
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

export const useVisualizationGeographicalAggregateValuesDataProvider: BaseVisualizationDataProviderHook<
  VisualizationGeographicalPointsModel,
  VisualizationGeographicalAggregateValuesConfigType
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

  const config = item.config;

  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions(
        'post',
        '/table/{project_id}/column/geographical/aggregate-values',
        {
          body: {
            latitude_column: config.latitude_column,
            longitude_column: config.longitude_column,
            label_column: config.label_column ?? null,
            method: config.method,
            target_column: item.column,
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
