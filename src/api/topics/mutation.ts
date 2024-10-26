import { ApiMutationFunction } from "@/common/api/fetch-types";
import { IdInput } from "../common/model";
import { useMutation } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";
import { queryClient } from "@/common/api/query-client";
import { projectTopicsEndpoint, TopicQueryKeys } from "./query";
import { ApiResult } from "@/common/api/model";

const ENDPOINT = "projects";
export function invalidateTopicQueries(id: string){
  queryClient.invalidateQueries({
    queryKey: [TopicQueryKeys.topicModelingKey, id]
  });
  queryClient.invalidateQueries({
    queryKey: [TopicQueryKeys.topicSimilarityKey, id]
  });
  queryClient.invalidateQueries({
    queryKey: [TopicQueryKeys.topicsKey, id]
  });
}
export function removeTopicQueries(id: string){
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


export const useStartTopicModeling: ApiMutationFunction<IdInput, ApiResult<never>> = function (options){
  return useMutation({
    ...options,
    mutationFn(body){
      return ApiFetch({
        url: `${projectTopicsEndpoint(body.id)}/start`,
        classType: undefined,
        method: 'post',
      })
    },
    onSuccess(data, variables, context) {
      invalidateTopicQueries(variables.id);
    },
  });
}