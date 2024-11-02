import { ApiMutationFunction } from "@/common/api/fetch-types";
import { ApiResult } from "@/common/api/model";
import { useMutation } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";
import { projectEvaluationEndpoint, TopicEvaluationQueryKeys} from "./query";
import { queryClient } from "@/common/api/query-client";
import { TopicsInput } from "../topics";

export const useSendTopicEvaluationRequest: ApiMutationFunction<TopicsInput, ApiResult<void>> = function (options) {
  return useMutation({
    ...options,
    mutationFn(body) {
      return ApiFetch({
        url: `${projectEvaluationEndpoint(body.id)}`,
        params: {
          column: body.column,
        },
        classType: undefined,
        method: 'post',
      });
    },
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: TopicEvaluationQueryKeys.evaluation(variables),
      });
    },
  });
}