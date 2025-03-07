import { ApiQueryFunction } from '@/common/api/fetch-types';
import { IdInput } from '../common/model';
import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/common/api/fetch';
import { ApiResult, ExtendedApiResult } from '@/common/api/model';
import {
  DocumentPerTopicModel,
  DocumentsPerTopicQueryInput,
  TopicModelingResultModel,
} from './model';
import { ProjectIdInput } from '../project';

export const TopicQueryKeys = {
  topicsKey: 'getTopics',
  documentPerTopicKey: 'getDocumentsPerTopic',
};

const ENDPOINT = 'topics';

export const useGetTopicModelingResult: ApiQueryFunction<
  ProjectIdInput,
  ApiResult<TopicModelingResultModel>
> = function (input, options) {
  return useQuery({
    queryKey: [TopicQueryKeys.topicsKey, input.projectId],
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${ENDPOINT}/${input.projectId}`,
        classType: TopicModelingResultModel,
        method: 'get',
      });
    },
  });
};

export const useGetDocumentsPerTopic: ApiQueryFunction<
  DocumentsPerTopicQueryInput,
  ExtendedApiResult<DocumentPerTopicModel[]>
> = function (input, options) {
  return useQuery({
    queryKey: [
      TopicQueryKeys.documentPerTopicKey,
      input.projectId,
      input.column,
      input.topic,
    ],
    ...options,
    queryFn() {
      const { projectId, ...restInput } = input;
      return ApiFetch({
        url: `${ENDPOINT}/${projectId}/documents`,
        params: restInput,
        classType: DocumentPerTopicModel,
        method: 'get',
      });
    },
  });
};
