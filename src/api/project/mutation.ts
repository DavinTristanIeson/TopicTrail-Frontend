import { ApiMutationFunction } from "@/common/api/fetch-types";
import { ProjectCheckDatasetModel, ProjectCheckIdInput, ProjectCheckIdModel, ProjectModel } from "./model";
import { ApiFetch } from "@/common/api/fetch";
import { useMutation } from "@tanstack/react-query";
import { ProjectConfigModel, ProjectDataSourceModel } from "./config.model";
import { queryClient } from "@/common/api/query-client";
import { ProjectQueryKeys } from "./query";
import { IdInput, UpdateInput } from "../common/model";
import { ApiResult } from "@/common/api/model";
import { invalidateTopicQueries, removeTopicQueries } from "../topics/mutation";

const ENDPOINT = "projects"
export const useProjectCheckId: ApiMutationFunction<ProjectCheckIdInput, ApiResult<ProjectCheckIdModel>> = function (options) {
  return useMutation({
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectCheckIdModel,
        method: 'post',
        body: input,
        url: `${ENDPOINT}/check-project-id`
      })
    },
    ...options,
  })
}

export const useProjectCheckDataset: ApiMutationFunction<ProjectDataSourceModel, ApiResult<ProjectCheckDatasetModel>> = function (options) {
  return useMutation({
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectCheckDatasetModel,
        method: 'post',
        body: input,
        url: `${ENDPOINT}/check-dataset`
      })
    },
    ...options,
  })
}

export const useCreateProject: ApiMutationFunction<ProjectConfigModel, ApiResult<ProjectModel>> = function (options) {
  return useMutation({
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectModel,
        method: "post",
        body: input,
        url: ENDPOINT,
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [ProjectQueryKeys.listKey]
      });
    },
  })
}

export const useUpdateProject: ApiMutationFunction<UpdateInput<ProjectConfigModel>, ApiResult<ProjectModel>> = function (options) {
  return useMutation({
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectModel,
        method: "put",
        body: input.body,
        url: `${ENDPOINT}/${input.id}`,
      })
    },
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: ProjectQueryKeys.detail(variables),
      });
      removeTopicQueries(variables.id);
      // Remember to invalidate a bunch of topic modeling stuff afterwards
    },
  })
}

export const useDeleteProject: ApiMutationFunction<IdInput, ApiResult<never>> = function (options) {
  return useMutation({
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: ProjectModel,
        method: "delete",
        url: `${ENDPOINT}/${input.id}`,
      })
    },
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [ProjectQueryKeys.listKey]
      });
      queryClient.removeQueries({
        queryKey: ProjectQueryKeys.detail(variables),
      });
      removeTopicQueries(variables.id);
    },
  })
}