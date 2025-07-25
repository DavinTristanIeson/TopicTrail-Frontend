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

export type TopicVisualizationModel =
  components['schemas']['TopicVisualizationResource'];
export type DocumentTopicsVisualizationModel =
  components['schemas']['DocumentTopicsVisualizationResource'];

export type TopicEvaluationResultModel =
  components['schemas']['TopicEvaluationResult'];
export type BERTopicExperimentResultModel =
  components['schemas']['BERTopicExperimentResult'];
export type BERTopicExperimentTrialResultModel =
  components['schemas']['BERTopicExperimentTrialResult'];
export type BERTopicHyperparameterConstraintModel =
  components['schemas']['BERTopicHyperparameterConstraint'];
export type TopicModelExperimentEnvironment =
  components['schemas']['TopicModelExperimentSchema'];

interface GetTopicLabelParams {
  id?: number;
  words?: [string, number][];
  label?: string | null;
}
export function getTopicLabel(topic: GetTopicLabelParams): string {
  if (topic.label) {
    return topic.label;
  }
  if (topic.words && topic.words.length > 0) {
    return topic.words
      .slice(0, 3)
      .map((word) => word[0])
      .join(', ');
  }
  if (topic.id) {
    return `Topic ${topic.id}`;
  }
  return 'Unnamed Topic';
}

export interface TaskResponseModel<T> {
  id: string;
  data: T | null;
  logs: components['schemas']['TaskLog'][];
  status: components['schemas']['TaskStatusEnum'];
}
