import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { TableColumnAggregatedTotalsModel } from '@/api/table';
import * as Yup from 'yup';
import React from 'react';

const VisualizationAggregatedTotalsDataProviderConfigSchema = Yup.object({
  groupedBy: Yup.object({
    name: Yup.string().required(),
    asc: Yup.boolean().required(),
  }),
});
export type VisualizationAggregatedTotalsDataProviderConfigType = Yup.InferType<
  typeof VisualizationAggregatedTotalsDataProviderConfigSchema
>;

export const useVisualizationAggregatedTotalsDataProvider: BaseVisualizationDataProviderHook<
  TableColumnAggregatedTotalsModel,
  VisualizationAggregatedTotalsDataProviderConfigType
> = function (item) {
  const { groups, params } = usePrepareDataProvider(item);

  const config = React.useMemo(() => {
    return VisualizationAggregatedTotalsDataProviderConfigSchema.validateSync(
      item.config,
    );
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
            grouped_by: config?.groupedBy ?? {
              name: item.column,
              asc: true,
            },
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
