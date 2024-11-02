import { ApiQueryFunction } from "@/common/api/fetch-types";
import { ProjectTaskResult } from "../project/model";
import { useQuery } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";
import { TopicsInput } from "../topics";
import { TopicEvaluationModel } from "./model";

export const TopicEvaluationQueryKeys = {
  evaluationKey: 'getEvaluation',
  evaluation(input: TopicsInput){
    return [TopicEvaluationQueryKeys.evaluationKey, input.id, input.column]
  },
}

export function projectEvaluationEndpoint(id: string){
  return `projects/${id}/evaluation`;
}

export const useGetTopicEvaluationStatus: ApiQueryFunction<TopicsInput, ProjectTaskResult<TopicEvaluationModel>> = function (input, options){
  return useQuery({
    ...options,
    queryKey: TopicEvaluationQueryKeys.evaluation(input),
    queryFn(){
      return ApiFetch({
        classType: TopicEvaluationModel,
        method: 'get',
        params: {
          column: input.column,
        },
        url: projectEvaluationEndpoint(input.id)
      });
    }
  });
}
