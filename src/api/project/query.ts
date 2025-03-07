import { ApiQueryFunction } from '@/common/api/fetch-types';
import {
  InferDatasetColumnModel,
  ProjectCheckDatasetColumnInput,
  ProjectLiteModel,
  ProjectModel,
} from './model';
import { IdInput } from '../common/model';
import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/common/api/fetch';
import { StaleTimes } from '../common/utils';
import { ApiResult, ExtendedApiResult } from '@/common/api/model';

export const ProjectQueryKeys = {
  listKey: 'getProjects',
  detailKey: 'getProject',
  inferColumnKey: 'inferProjectDatasetColumn',
};

const ENDPOINT = 'projects';

export function ProjectQueryKey(
  id: string,
  marker: string,
  additional?: any[],
): string[] {
  const key = [ProjectQueryKeys.detailKey, id, marker];
  if (additional) {
    key.push(...additional);
  }
  return key;
}

export const useGetProjects: ApiQueryFunction<
  void,
  ExtendedApiResult<ProjectLiteModel[]>
> = function (input, options) {
  return useQuery({
    queryKey: [ProjectQueryKeys.listKey],
    staleTime: StaleTimes.Long,
    ...options,
    queryFn() {
      return ApiFetch({
        url: ENDPOINT,
        classType: ProjectLiteModel,
        method: 'get',
      });
    },
  });
};

export const useGetProject: ApiQueryFunction<
  IdInput,
  ApiResult<ProjectModel>
> = function (input, options) {
  return useQuery({
    queryKey: [ProjectQueryKeys.detailKey, input.id],
    staleTime: StaleTimes.Long,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${ENDPOINT}/${input.id}`,
        classType: ProjectModel,
        method: 'get',
      });
    },
  });
};

export const useGetProjectDatasetColumnInference: ApiQueryFunction<
  ProjectCheckDatasetColumnInput,
  ApiResult<InferDatasetColumnModel>
> = function (input, options) {
  return useQuery({
    staleTime: StaleTimes.Medium,
    queryKey: [
      ProjectQueryKeys.inferColumnKey,
      input.source,
      input.column,
      input.dtype,
    ],
    queryFn(input) {
      return ApiFetch({
        classType: InferDatasetColumnModel,
        method: 'post',
        body: input,
        url: `${ENDPOINT}/check-dataset-column`,
      });
    },
    ...options,
  });
};
