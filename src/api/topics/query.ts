import { ApiQueryFunction } from "@/common/api/fetch-types";
import { TopicModelingStatusInput, TopicSimilarityInput, TopicSimilarityModel, TopicsInput, TopicsModel } from "./model";
import { ProjectTaskResult } from "../project/model";
import { useQuery } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";
import { IdInput } from "../common/model";

export const TopicQueryKeys = {
  topicModelingKey: 'getTopicModelingStatus',
  topicModeling(input: TopicModelingStatusInput){
    return [TopicQueryKeys.topicModelingKey, input.id];
  },

  topicsKey: 'getTopics',
  topics(input: TopicsInput){
    return [TopicQueryKeys.topicsKey, input.id, input.column]
  },

  topicSimilarityKey: 'getTopicSimilarity',
  topicSimilarity(input: TopicSimilarityInput){
    return [TopicQueryKeys.topicSimilarityKey, input.id, input.column];
  }
}

function endpoint(id: string){
  return `projects/${id}/topics`;
}

export const useGetTopicModelingStatus: ApiQueryFunction<IdInput, ProjectTaskResult<never>> = function (input, options){
  return useQuery({
    queryKey: TopicQueryKeys.topicModeling(input),
    queryFn(){
      return ApiFetch({
        classType: undefined,
        method: 'get',
        body: input,
        url: `projects/${input.id}/status`
      });
    }
  });
}

export const useGetTopics: ApiQueryFunction<TopicsInput, ProjectTaskResult<TopicsModel>> = function (input, options){
  return useQuery({
    queryKey: TopicQueryKeys.topics(input),
    queryFn(){
      return ApiFetch({
        classType: TopicsModel,
        method: 'get',
        params: input,
        url: `${endpoint(input.id)}/${input.column}`
      });
    }
  });
}

export const useGetTopicSimilarity: ApiQueryFunction<TopicSimilarityInput, ProjectTaskResult<TopicsModel>> = function (input, options){
  return useQuery({
    queryKey: TopicQueryKeys.topicSimilarity(input),
    queryFn(){
      return ApiFetch({
        classType: TopicSimilarityModel,
        method: 'get',
        params: input,
        url: `${endpoint(input.id)}/${input.column}/similarity`
      });
    }
  });
}