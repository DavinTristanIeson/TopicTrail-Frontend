import { DescriptiveStatisticsModel } from '@/api/table';
import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';
import {
  BaseVisualizationConfig,
  BaseVisualizationDataProviderHook,
} from '../types';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries } from './utils';
import { DashboardItemModel } from '@/api/userdata';

export const useDescriptiveStatisticsDataProvider: BaseVisualizationDataProviderHook<
  DescriptiveStatisticsModel,
  DashboardItemModel
> = function (config) {
  const project = React.useContext(ProjectContext);
  const queries = useQueries({
    queries: config.groups.map((group) =>
      client.queryOptions(
        'post',
        '/table/{project_id}/column/descriptive-statistics',
        {
          body: {
            column: config.column.name,
            filter: group.filter,
          },
          params: {
            path: {
              project_id: project.id,
            },
          },
        },
      ),
    ),
  });

  return useAdaptDataProviderQueries({
    queries,
    groups: config.groups,
    extract: (data) => data.data.statistics,
  });
};
