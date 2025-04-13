import { UseQueryResult } from '@tanstack/react-query';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { ApiError } from '@/api/common';
import { zip } from 'lodash-es';
import { NamedTableFilterModel } from '@/api/comparison';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import { DashboardGroupsContext } from '../types/context';
import { DashboardItemModel } from '@/api/userdata';

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
      .filter((item) => !item[1]?.data)
      .map((item) => {
        return {
          name: item[0]!.name,
          data: props.extract(item[1]!.data!),
        };
      }),
    loading: props.queries.some((query) => query.isFetching),
    error: props.queries.find((query) => !!query.error)?.error?.message,
  };
}

export function usePrepareDataProvider(props: DashboardItemModel) {
  const project = React.useContext(ProjectContext);
  const groups = React.useContext(DashboardGroupsContext);
  const column = project.config.data_schema.columns.find(
    (column) => column.name === props.column,
  );
  if (!column) {
    throw Error(
      `Oops, we weren't able to find this column: ${props.column}. Perhaps this dashboard item is associated with an old dataset version.`,
    );
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
