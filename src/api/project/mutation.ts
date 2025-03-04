import { ApiMutationFunction } from '@/common/api/fetch-types';
import {
  ProjectCheckDatasetModel,
  ProjectIdInput,
  ProjectModel,
  ProjectMutationInput,
  ProjectCheckDatasetInput,
  ProjectColumnsMutationInput,
} from './model';
import { ApiFetch } from '@/common/api/fetch';
import { useMutation } from '@tanstack/react-query';
import { ProjectQueryKeys } from './query';
import { IdInput, UpdateInput } from '../common/model';
import { ApiResult } from '@/common/api/model';
import { QueryInvalidator } from '../common/utils';

const ENDPOINT = 'projects';
export const useCheckProjectId: ApiMutationFunction<
  ProjectIdInput,
  ApiResult<never>
> = function (options) {
  return useMutation({
    mutationFn(input) {
      return ApiFetch({
        classType: undefined,
        method: 'post',
        body: input,
        url: `${ENDPOINT}/check-project-id`,
      });
    },
    ...options,
  });
};

export const useCheckProjectDataset: ApiMutationFunction<
  ProjectCheckDatasetInput,
  ApiResult<ProjectCheckDatasetModel>
> = function (options) {
  return useMutation({
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectCheckDatasetModel,
        method: 'post',
        body: input,
        url: `${ENDPOINT}/check-dataset`,
      });
    },
    ...options,
  });
};

export const useCreateProject: ApiMutationFunction<
  ProjectMutationInput,
  ApiResult<ProjectModel>
> = function (options) {
  return useMutation({
    ...QueryInvalidator.Create(
      ProjectQueryKeys.listKey,
      ProjectQueryKeys.detailKey,
    ),
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectModel,
        method: 'post',
        body: input,
        url: ENDPOINT,
      });
    },
  });
};

export const useUpdateProjectColumns: ApiMutationFunction<
  UpdateInput<ProjectColumnsMutationInput>,
  ApiResult<ProjectModel>
> = function (options) {
  return useMutation({
    ...QueryInvalidator.Update(
      ProjectQueryKeys.listKey,
      ProjectQueryKeys.detailKey,
    ),
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectModel,
        method: 'put',
        body: input.body,
        url: `${ENDPOINT}/${input.id}/columns`,
      });
    },
  });
};

export const useUpdateProjectId: ApiMutationFunction<
  UpdateInput<ProjectIdInput>,
  ApiResult<ProjectModel>
> = function (options) {
  return useMutation({
    ...QueryInvalidator.Update(
      ProjectQueryKeys.listKey,
      ProjectQueryKeys.detailKey,
    ),
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectModel,
        method: 'put',
        body: input.body,
        url: `${ENDPOINT}/${input.id}`,
      });
    },
  });
};

export const useUpdateProject: ApiMutationFunction<
  UpdateInput<ProjectMutationInput>,
  ApiResult<ProjectModel>
> = function (options) {
  return useMutation({
    ...QueryInvalidator.Update(
      ProjectQueryKeys.listKey,
      ProjectQueryKeys.detailKey,
    ),
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectModel,
        method: 'put',
        body: input.body,
        url: `${ENDPOINT}/${input.id}`,
      });
    },
  });
};

export const useDeleteProject: ApiMutationFunction<
  IdInput,
  ApiResult<never>
> = function (options) {
  return useMutation({
    ...QueryInvalidator.Delete(
      ProjectQueryKeys.listKey,
      ProjectQueryKeys.detailKey,
    ),
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectModel,
        method: 'delete',
        url: `${ENDPOINT}/${input.id}`,
      });
    },
  });
};
