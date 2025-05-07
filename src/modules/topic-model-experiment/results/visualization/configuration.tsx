import {
  BERTopicExperimentTrialResultModel,
  BERTopicHyperparameterConstraintModel,
} from '@/api/topic';
import { type ComboboxItem, MultiSelect, Select } from '@mantine/core';
import React from 'react';

export enum TopicModelExperimentHyperparameterType {
  MaxTopics = 'max_topics',
  MinTopicSize = 'min_topic_size',
  TopicConfidenceThreshold = 'topic_confidence_threshold',
}

const TOPIC_MODEL_EXPERIMENT_HYPERPARAMETER_DICTIONARY = {
  [TopicModelExperimentHyperparameterType.MaxTopics]: {
    label: 'Max. Topics',
    value: TopicModelExperimentHyperparameterType.MaxTopics,
  },
  [TopicModelExperimentHyperparameterType.MinTopicSize]: {
    label: 'Min. Topic Size',
    value: TopicModelExperimentHyperparameterType.MinTopicSize,
  },
  [TopicModelExperimentHyperparameterType.TopicConfidenceThreshold]: {
    label: 'Topic Confidence Threshold',
    value: TopicModelExperimentHyperparameterType.TopicConfidenceThreshold,
  },
};

function useTopicModelExperimentHyperparameterTypeSelectProps(
  constraint: BERTopicHyperparameterConstraintModel,
  hyperparameter: TopicModelExperimentHyperparameterType | null | undefined,
) {
  const options = React.useMemo(() => {
    const options: ComboboxItem[] = [];
    if (constraint.max_topics) {
      options.push(
        TOPIC_MODEL_EXPERIMENT_HYPERPARAMETER_DICTIONARY[
          TopicModelExperimentHyperparameterType.MaxTopics
        ],
      );
    }
    if (constraint.min_topic_size) {
      options.push(
        TOPIC_MODEL_EXPERIMENT_HYPERPARAMETER_DICTIONARY[
          TopicModelExperimentHyperparameterType.MinTopicSize
        ],
      );
    }
    if (constraint.topic_confidence_threshold) {
      options.push(
        TOPIC_MODEL_EXPERIMENT_HYPERPARAMETER_DICTIONARY[
          TopicModelExperimentHyperparameterType.TopicConfidenceThreshold
        ],
      );
    }
    return options;
  }, [
    constraint.max_topics,
    constraint.min_topic_size,
    constraint.topic_confidence_threshold,
  ]);

  const accessor = React.useCallback(
    (trial: BERTopicExperimentTrialResultModel) => {
      switch (hyperparameter) {
        case TopicModelExperimentHyperparameterType.MaxTopics: {
          return trial.candidate.max_topics;
        }
        case TopicModelExperimentHyperparameterType.MinTopicSize: {
          return trial.candidate.min_topic_size;
        }
        case TopicModelExperimentHyperparameterType.TopicConfidenceThreshold: {
          return trial.candidate.topic_confidence_threshold;
        }
        default: {
          return undefined;
        }
      }
    },
    [hyperparameter],
  );
  const hyperparameterName = hyperparameter
    ? (TOPIC_MODEL_EXPERIMENT_HYPERPARAMETER_DICTIONARY[hyperparameter]
        ?.label ?? 'Hyperparameter')
    : 'Hyperparameter';
  return { accessor, options, hyperparameterName };
}

export function useTopicModelExperimentHyperparameterTypeSelect(
  constraint: BERTopicHyperparameterConstraintModel,
) {
  const [hyperparameter, setHyperparameter] =
    React.useState<TopicModelExperimentHyperparameterType | null>(null);
  const { accessor, options, hyperparameterName } =
    useTopicModelExperimentHyperparameterTypeSelectProps(
      constraint,
      hyperparameter,
    );

  const Component = (
    <Select
      value={hyperparameter}
      onChange={
        setHyperparameter as React.Dispatch<React.SetStateAction<string | null>>
      }
      data={options}
      label="Select Hyperparameter"
      required
      allowDeselect={false}
    />
  );
  return {
    hyperparameter,
    setHyperparameter,
    accessor,
    options,
    hyperparameterName,
    Component,
  };
}

export function useTopicModelExperimentHyperparameterTypeMultiSelect(
  constraint: BERTopicHyperparameterConstraintModel,
) {
  const [hyperparameters, setHyperparameters] = React.useState<
    TopicModelExperimentHyperparameterType[]
  >([]);
  const {
    accessor: accessorX,
    options,
    hyperparameterName: hyperparameterNameY,
  } = useTopicModelExperimentHyperparameterTypeSelectProps(
    constraint,
    hyperparameters[0],
  );
  const { accessor: accessorY, hyperparameterName: hyperparameterNameX } =
    useTopicModelExperimentHyperparameterTypeSelectProps(
      constraint,
      hyperparameters[0],
    );

  const Component = (
    <MultiSelect
      value={hyperparameters}
      maxValues={2}
      onChange={
        setHyperparameters as React.Dispatch<React.SetStateAction<string[]>>
      }
      data={options}
      label="Select Hyperparameter"
      required
    />
  );

  return {
    accessorX,
    accessorY,
    hyperparameters,
    hyperparameterNameX,
    hyperparameterNameY,
    Component,
  };
}

export enum TopicEvaluationType {
  Coherence = 'coherence',
  Diversity = 'diversity',
  TopicCounts = 'topic-counts',
}

const TOPIC_EVALUATION_TYPE_DICTIONARY = {
  [TopicEvaluationType.Coherence]: {
    label: 'Topic Coherence',
    value: TopicEvaluationType.Coherence,
  },
  [TopicEvaluationType.Diversity]: {
    label: 'Topic Diversity',
    value: TopicEvaluationType.Diversity,
  },
  [TopicEvaluationType.TopicCounts]: {
    label: 'Topic Count',
    value: TopicEvaluationType.TopicCounts,
  },
};

function useTopicEvaluationTypeSelectProps(
  evaluationType: TopicEvaluationType | null | undefined,
) {
  const accessor = React.useCallback(
    (trial: BERTopicExperimentTrialResultModel) => {
      switch (evaluationType) {
        case TopicEvaluationType.Coherence: {
          return trial.evaluation?.coherence_v;
        }
        case TopicEvaluationType.Diversity: {
          return trial.evaluation?.topic_diversity;
        }
        case TopicEvaluationType.TopicCounts: {
          return trial.evaluation?.coherence_v_per_topic.length;
        }
        default: {
          return undefined;
        }
      }
    },
    [evaluationType],
  );
  const evaluationName = evaluationType
    ? (TOPIC_EVALUATION_TYPE_DICTIONARY[evaluationType]?.label ?? 'Evaluation')
    : 'Evaluation';
  return { accessor, evaluationName };
}

export function useTopicEvaluationTypeSelect() {
  const [evaluationType, setEvaluationType] =
    React.useState<TopicEvaluationType | null>(TopicEvaluationType.Coherence);
  const Component = (
    <Select
      value={evaluationType}
      onChange={
        setEvaluationType as React.Dispatch<React.SetStateAction<string | null>>
      }
      data={Object.values(TOPIC_EVALUATION_TYPE_DICTIONARY)}
      label="Select Evaluation Type"
      required
      allowDeselect={false}
    />
  );

  const { accessor, evaluationName } =
    useTopicEvaluationTypeSelectProps(evaluationType);

  return {
    evaluationType,
    evaluationName,
    accessor,
    Component,
  };
}

export function useTopicEvaluationTypeMultiSelect() {
  const [evaluationTypes, setEvaluationTypes] = React.useState<
    TopicEvaluationType[]
  >([TopicEvaluationType.Coherence, TopicEvaluationType.Diversity]);
  const Component = (
    <MultiSelect
      value={evaluationTypes}
      maxValues={2}
      onChange={
        setEvaluationTypes as React.Dispatch<React.SetStateAction<string[]>>
      }
      data={Object.values(TOPIC_EVALUATION_TYPE_DICTIONARY)}
      label="Select Evaluation Type"
      required
    />
  );
  const { accessor: accessorX, evaluationName: evaluationNameX } =
    useTopicEvaluationTypeSelectProps(evaluationTypes[0]);
  const { accessor: accessorY, evaluationName: evaluationNameY } =
    useTopicEvaluationTypeSelectProps(evaluationTypes[1]);

  return {
    evaluationTypes,
    accessorX,
    accessorY,
    evaluationNameX,
    evaluationNameY,
    Component,
  };
}
