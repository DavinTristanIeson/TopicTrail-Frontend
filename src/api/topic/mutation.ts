import { ApiMutationFunction } from '@/common/api/fetch-types';
import {
  RefineTopicHierarchyInput,
  TopicModelingResultModel,
  RefineDocumentTopicAssignmentsInput,
} from './model';
import { ApiFetch } from '@/common/api/fetch';
import { useMutation } from '@tanstack/react-query';
import { ApiResult } from '@/common/api/model';
import { TopicQueryKeys } from '../topic/query';
import { queryClient } from '@/common/api/query-client';

const ENDPOINT = 'topics';

function invalidateTopics() {
  queryClient.invalidateQueries({
    queryKey: [TopicQueryKeys.topicsKey],
  });
  queryClient.invalidateQueries({
    queryKey: [TopicQueryKeys.documentPerTopicKey],
  });
}
export const useRefineTopicHierarchy: ApiMutationFunction<
  RefineTopicHierarchyInput,
  ApiResult<TopicModelingResultModel>
> = function (options) {
  return useMutation({
    onSuccess: invalidateTopics,
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: undefined,
        method: 'post',
        body: input,
        url: `${ENDPOINT}/refine-hierarchy`,
      });
    },
  });
};

export const useRefineDocumentTopicAssignments: ApiMutationFunction<
  RefineDocumentTopicAssignmentsInput,
  ApiResult<TopicModelingResultModel>
> = function (options) {
  return useMutation({
    onSuccess: invalidateTopics,
    ...options,
    mutationFn(input) {
      return ApiFetch({
        classType: undefined,
        method: 'post',
        body: input,
        url: `${ENDPOINT}/refine-document-topic-assignments`,
      });
    },
  });
};
