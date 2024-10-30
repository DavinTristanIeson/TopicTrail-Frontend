import { ApiMutationFunction } from "@/common/api/fetch-types";
import { IdInput } from "../common/model";
import { useMutation } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";
import { queryClient } from "@/common/api/query-client";
import { projectTopicsEndpoint, TopicQueryKeys } from "./query";
import { ApiResult } from "@/common/api/model";
import { TopicsInput } from "./model";
import { VariableAssociationQueryKeys } from "../association/query";

export function invalidateTopicQueries(id: string) {
  queryClient.invalidateQueries({
    queryKey: [TopicQueryKeys.topicModelingKey, id]
  });
  queryClient.invalidateQueries({
    queryKey: [TopicQueryKeys.topicSimilarityKey, id]
  });
  queryClient.invalidateQueries({
    queryKey: [TopicQueryKeys.topicsKey, id]
  });
  queryClient.invalidateQueries({
    queryKey: [VariableAssociationQueryKeys.associationKey, id]
  })
}
export function removeTopicQueries(id: string) {
  queryClient.removeQueries({
    queryKey: [TopicQueryKeys.topicModelingKey, id]
  });
  queryClient.removeQueries({
    queryKey: [TopicQueryKeys.topicSimilarityKey, id]
  });
  queryClient.removeQueries({
    queryKey: [TopicQueryKeys.topicsKey, id]
  });
}


export const useStartTopicModeling: ApiMutationFunction<IdInput, ApiResult<void>> = function (options) {
  return useMutation({
    ...options,
    mutationFn(body) {
      return ApiFetch({
        url: `${projectTopicsEndpoint(body.id)}/start`,
        classType: undefined,
        method: 'post',
      })
    },
    onSuccess(data, variables) {
      invalidateTopicQueries(variables.id);
    },
  });
}


export const useSendTopicRequest: ApiMutationFunction<TopicsInput, ApiResult<void>> = function (options) {
  return useMutation({
    ...options,
    mutationFn(body) {
      return ApiFetch({
        url: `${projectTopicsEndpoint(body.id)}/${body.column}`,
        classType: undefined,
        method: 'post',
      })
    },
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: TopicQueryKeys.topics(variables),
      });
    },
  });
}

export const useSendTopicSimilarityRequest: ApiMutationFunction<TopicsInput, ApiResult<void>> = function (options) {
  return useMutation({
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: undefined,
        method: 'post',
        url: `${projectTopicsEndpoint(input.id)}/${input.column}/similarity`
      });
    },
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: TopicQueryKeys.topicSimilarity(variables),
      })
    },
  });
}