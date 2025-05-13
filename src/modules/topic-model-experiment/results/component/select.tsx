import {
  BERTopicExperimentTrialResultModel,
  BERTopicHyperparameterConstraintModel,
} from '@/api/topic';
import { type ComboboxItem } from '@mantine/core';
import React from 'react';

export enum TopicModelExperimentValueType {
  TopicCount = 'topic-count',
  TopicCoherence = 'topic-coherence',
  TopicDiversity = 'topic-diversity',
  SilhouetteScore = 'silhouette-score',
  TrialNumber = 'trial-number',
  MaxTopics = 'max-topics',
  MinTopicSize = 'min-topic-size',
  TopicConfidenceThreshold = 'topic-confidence-threshold',
}

interface TopicModelExperimentValueTypeEntryType {
  label: string;
  value: TopicModelExperimentValueType;
  accessor(
    trial: BERTopicExperimentTrialResultModel,
  ): number | null | undefined;
}

export const TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY: Record<
  TopicModelExperimentValueType,
  TopicModelExperimentValueTypeEntryType
> = {
  [TopicModelExperimentValueType.MaxTopics]: {
    label: 'Max. Topics',
    value: TopicModelExperimentValueType.MaxTopics,
    accessor: (trial: BERTopicExperimentTrialResultModel) =>
      trial.candidate.max_topics,
  },
  [TopicModelExperimentValueType.MinTopicSize]: {
    label: 'Min. Topic Size',
    value: TopicModelExperimentValueType.MinTopicSize,
    accessor: (trial: BERTopicExperimentTrialResultModel) =>
      trial.candidate.min_topic_size,
  },
  [TopicModelExperimentValueType.TopicConfidenceThreshold]: {
    label: 'Topic Confidence Threshold',
    value: TopicModelExperimentValueType.TopicConfidenceThreshold,
    accessor: (trial: BERTopicExperimentTrialResultModel) =>
      trial.candidate.topic_confidence_threshold,
  },
  [TopicModelExperimentValueType.TopicCoherence]: {
    label: 'Topic Coherence',
    value: TopicModelExperimentValueType.TopicCoherence,
    accessor: (trial: BERTopicExperimentTrialResultModel) =>
      trial.evaluation?.coherence_v,
  },
  [TopicModelExperimentValueType.TopicDiversity]: {
    label: 'Topic Diversity',
    value: TopicModelExperimentValueType.TopicDiversity,
    accessor: (trial: BERTopicExperimentTrialResultModel) =>
      trial.evaluation?.topic_diversity,
  },
  [TopicModelExperimentValueType.SilhouetteScore]: {
    label: 'Silhouette Score',
    value: TopicModelExperimentValueType.SilhouetteScore,
    accessor: (trial: BERTopicExperimentTrialResultModel) =>
      trial.evaluation?.silhouette_score,
  },
  [TopicModelExperimentValueType.TopicCount]: {
    label: 'Topic Count',
    value: TopicModelExperimentValueType.TopicCount,
    accessor: (trial: BERTopicExperimentTrialResultModel) =>
      trial.evaluation?.topics.length,
  },
  [TopicModelExperimentValueType.TrialNumber]: {
    label: 'Trial Number',
    value: TopicModelExperimentValueType.TrialNumber,
    accessor: (trial: BERTopicExperimentTrialResultModel) => trial.trial_number,
  },
};

interface UseTopicModelExperimentValueOptionsProps {
  constraint: BERTopicHyperparameterConstraintModel | null;
}

export function useTopicModelExperimentValueOptions(
  props: UseTopicModelExperimentValueOptionsProps,
) {
  const { constraint } = props;

  return React.useMemo(() => {
    const hyperparameterOptions: ComboboxItem[] = [];
    if (!constraint || constraint.max_topics) {
      hyperparameterOptions.push(
        TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[
          TopicModelExperimentValueType.MaxTopics
        ],
      );
    }
    if (!constraint || constraint.min_topic_size) {
      hyperparameterOptions.push(
        TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[
          TopicModelExperimentValueType.MinTopicSize
        ],
      );
    }
    if (!constraint || constraint.topic_confidence_threshold) {
      hyperparameterOptions.push(
        TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[
          TopicModelExperimentValueType.TopicConfidenceThreshold
        ],
      );
    }
    return [
      {
        group: 'Hyperparameters',
        items: hyperparameterOptions,
      },
      {
        group: 'Evaluation Results',
        items: [
          TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[
            TopicModelExperimentValueType.TopicCoherence
          ],
          TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[
            TopicModelExperimentValueType.TopicDiversity
          ],
          TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[
            TopicModelExperimentValueType.SilhouetteScore
          ],
          TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[
            TopicModelExperimentValueType.TopicCount
          ],
        ],
      },
      {
        group: 'Others',
        items: [
          TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[
            TopicModelExperimentValueType.TrialNumber
          ],
        ],
      },
    ];
  }, [constraint]);
}
