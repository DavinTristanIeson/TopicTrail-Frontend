import { components } from './openapi';

export type TopicModel = components['schemas']['Topic'];
export type TopicModelingResultModel =
  components['schemas']['TopicModelingResult'];
export type ColumnTopicModelingResultModel =
  components['schemas']['ColumnTopicModelingResultResource'];
export type DocumentPerTopicModel =
  components['schemas']['DocumentPerTopicResource'];

export type TopicModelingTaskResponseModel =
  components['schemas']['TaskResponse_TopicModelingResult_'];
export type TaskLogModel = components['schemas']['TaskLog'];
