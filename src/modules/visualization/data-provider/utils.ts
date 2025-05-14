import { UseQueryResult } from '@tanstack/react-query';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { ApiError } from '@/api/common';
import { zip } from 'lodash-es';
import { NamedTableFilterModel } from '@/api/comparison';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import { useDashboardSubdatasets } from '../types/context';
import { DashboardItemModel } from '@/api/userdata';
import { findProjectColumn } from '@/api/project';

interface UseAdaptDataProviderQueriesParams<TQuery, TData> {
  groups: NamedTableFilterModel[];
  queries: UseQueryResult<TQuery, ApiError>[];
  extract(queryData: TQuery): TData;
}

export function useAdaptDataProviderQueries<TQuery, TData>(
  props: UseAdaptDataProviderQueriesParams<TQuery, TData>,
): ReturnType<BaseVisualizationDataProviderHook<TData, any>> {
  return {
    data: zip(props.groups, props.queries)
      .filter((item) => !!item[1]?.data)
      .map((item) => {
        return {
          name: item[0]!.name,
          data: props.extract(item[1]!.data!),
        };
      }),
    loading: props.queries.some((query) => query.isFetching),
    error: props.queries.find((query) => !!query.error)?.error?.message,
    refetch: () => {
      for (const query of props.queries) {
        if (query.error || !query.data) {
          query.refetch();
        }
      }
    },
  };
}

export function usePrepareDataProvider(props: DashboardItemModel) {
  const project = React.useContext(ProjectContext);
  const column = findProjectColumn(project, props.column);
  if (!column) {
    throw new Error(
      `Oops, we weren't able to find this column: ${props.column}. Perhaps this dashboard item is associated with an old dataset version.`,
    );
  }
  const groups = useDashboardSubdatasets(props, column);
  if (groups.length === 0) {
    throw new Error(`Provide at least one subdataset to be analyzed.`);
  }
  return {
    column,
    groups,
    project,
    params: {
      path: {
        project_id: project.id,
      },
    },
  };
}
