import { UseQueryResult } from '@tanstack/react-query';
import { BaseVisualizationDataProviderHook } from '../types';
import { ApiError } from '@/api/common';
import { zip } from 'lodash';
import { NamedTableFilterModel } from '@/api/comparison';

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
