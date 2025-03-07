import { ApiFetch } from '@/common/api/fetch';
import { ApiQueryFunction } from '@/common/api/fetch-types';
import { ApiResult, ExtendedApiResult } from '@/common/api/model';
import { useQuery } from '@tanstack/react-query';
import { DataFrame, IdInput, PaginatedInput, StaleTimes } from '../common';
import {
  ProjectQueryKey,
  ProjectLiteModel,
  ProjectQueryKeys,
  ProjectIdInput,
} from '../project';
import {
  TableColumnCountsModel,
  TableColumnFrequencyDistributionModel,
  TableColumnGeographicalPointsModel,
  TableColumnQueryInput,
  TableColumnTopicWordsModel,
  TableColumnValuesModel,
  TableColumnWordFrequenciesModel,
  TableGeoraphicalColumnQueryInput,
} from './model/column';

export const TableQueryKeys = {
  tableKey: 'getTables',
  columnValuesKey: 'getColumnValues',
  columnFrequencyDistributionKey: 'getColumnFrequencyDistribution',
  countsKey: 'getCountsKey',
  geographicalKey: 'getGeographicalKey',
  uniqueKey: 'getUniqueKey',
  wordFrequenciesKey: 'getWordFrequencies',
  topicWordsKey: 'getTopicWords',
};

const ENDPOINT = 'table';

export const useGetTable: ApiQueryFunction<
  PaginatedInput & ProjectIdInput,
  ExtendedApiResult<DataFrame>
> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKey(input.projectId, TableQueryKeys.tableKey, [
      input,
    ]),
    staleTime: StaleTimes.Medium,
    gcTime: StaleTimes.Short,
    ...options,
    queryFn() {
      return ApiFetch({
        url: ENDPOINT,
        classType: undefined,
        method: 'get',
      });
    },
  });
};

const COLUMN_ENDPOINT = 'table/column';

export const useGetColumnValues: ApiQueryFunction<
  TableColumnQueryInput,
  ApiResult<TableColumnValuesModel>
> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKey(input.projectId, TableQueryKeys.columnValuesKey),
    staleTime: StaleTimes.Medium,
    gcTime: StaleTimes.Short,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${COLUMN_ENDPOINT}/values`,
        classType: TableColumnValuesModel,
        method: 'get',
      });
    },
  });
};

export const useGetColumnFrequencyDistribution: ApiQueryFunction<
  TableColumnQueryInput,
  ApiResult<TableColumnFrequencyDistributionModel>
> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKey(
      input.projectId,
      TableQueryKeys.columnFrequencyDistributionKey,
      [input],
    ),
    staleTime: StaleTimes.Medium,
    gcTime: StaleTimes.Short,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${COLUMN_ENDPOINT}/frequency-distribution`,
        classType: TableColumnFrequencyDistributionModel,
        method: 'post',
      });
    },
  });
};

export const useGetColumnCounts: ApiQueryFunction<
  TableColumnQueryInput,
  ApiResult<TableColumnCountsModel>
> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKey(input.projectId, TableQueryKeys.countsKey, [
      input,
    ]),
    staleTime: StaleTimes.Medium,
    gcTime: StaleTimes.Short,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${COLUMN_ENDPOINT}/counts`,
        classType: TableColumnCountsModel,
        method: 'post',
      });
    },
  });
};

export const useGetColumnGeographicalPoints: ApiQueryFunction<
  TableGeoraphicalColumnQueryInput,
  ApiResult<TableColumnGeographicalPointsModel>
> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKey(input.projectId, TableQueryKeys.geographicalKey, [
      input,
    ]),
    staleTime: StaleTimes.Medium,
    gcTime: StaleTimes.Short,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${COLUMN_ENDPOINT}/geographical`,
        classType: TableColumnGeographicalPointsModel,
        method: 'post',
      });
    },
  });
};

export const useGetColumnUniqueValues: ApiQueryFunction<
  TableColumnQueryInput,
  ApiResult<TableColumnValuesModel>
> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKey(input.projectId, TableQueryKeys.uniqueKey, [
      input,
    ]),
    staleTime: StaleTimes.Medium,
    gcTime: StaleTimes.Short,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${COLUMN_ENDPOINT}/unique`,
        classType: TableColumnValuesModel,
        method: 'post',
      });
    },
  });
};

export const useGetColumnWordFrequencies: ApiQueryFunction<
  TableColumnQueryInput,
  ApiResult<TableColumnWordFrequenciesModel>
> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKey(
      input.projectId,
      TableQueryKeys.wordFrequenciesKey,
      [input],
    ),
    staleTime: StaleTimes.Medium,
    gcTime: StaleTimes.Short,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${COLUMN_ENDPOINT}/word-frequencies`,
        classType: TableColumnWordFrequenciesModel,
        method: 'post',
      });
    },
  });
};

export const useGetColumnTopicWords: ApiQueryFunction<
  TableColumnQueryInput,
  ApiResult<TableColumnTopicWordsModel>
> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKey(input.projectId, TableQueryKeys.topicWordsKey, [
      input,
    ]),
    staleTime: StaleTimes.Medium,
    gcTime: StaleTimes.Short,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${COLUMN_ENDPOINT}/topic-words`,
        classType: TableColumnTopicWordsModel,
        method: 'post',
      });
    },
  });
};
