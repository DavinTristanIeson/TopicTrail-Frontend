import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { VisualizationAggregateValuesModel } from '@/api/table';

import React from 'react';
import {
  VisualizationAggregateValuesConfigSchema,
  VisualizationAggregateValuesConfigType,
} from '../configuration/aggregate-values';

export const useVisualizationAggregatedTotalsDataProvider: BaseVisualizationDataProviderHook<
  VisualizationAggregateValuesModel,
  VisualizationAggregateValuesConfigType
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

  const config = React.useMemo(() => {
    return VisualizationAggregateValuesConfigSchema.validateSync(item.config);
  }, [item.config]);

  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions(
        'post',
        '/table/{project_id}/column/aggregate-totals',
        {
          body: {
            column: item.column,
            filter: group.filter,
            grouped_by: config?.grouped_by,
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
