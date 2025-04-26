import { DescriptiveStatisticsModel } from '@/api/table';
import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries } from './utils';
import { DashboardItemModel } from '@/api/userdata';
import { DashboardGroupsContext } from '../types/context';

export const useVisualizationDescriptiveStatisticsDataProvider: BaseVisualizationDataProviderHook<
  DescriptiveStatisticsModel,
  DashboardItemModel
> = function (config) {
  const project = React.useContext(ProjectContext);
  const groups = React.useContext(DashboardGroupsContext);
  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions(
        'post',
        '/table/{project_id}/column/descriptive-statistics',
        {
          body: {
            column: config.column,
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
    groups,
    extract: (data) => data.data.statistics,
  });
};
