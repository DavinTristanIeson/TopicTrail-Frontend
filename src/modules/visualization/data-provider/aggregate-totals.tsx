import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { VisualizationAggregatedTotalsModel } from '@/api/table';

import React from 'react';
import {
  VisualizationAggregateTotalsConfigSchema,
  VisualizationAggregateTotalsConfigType,
} from '../configuration/aggregate-totals';

export const useVisualizationAggregatedTotalsDataProvider: BaseVisualizationDataProviderHook<
  VisualizationAggregatedTotalsModel,
  VisualizationAggregateTotalsConfigType
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

  const config = React.useMemo(() => {
    return VisualizationAggregateTotalsConfigSchema.validateSync(item.config);
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
