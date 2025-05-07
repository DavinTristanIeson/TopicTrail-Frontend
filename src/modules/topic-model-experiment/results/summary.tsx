import {
  BERTopicExperimentResultModel,
  BERTopicHyperparameterConstraintModel,
} from '@/api/topic';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { Select, Stack } from '@mantine/core';
import React from 'react';
import {
  TopicModelExperimentResultVisualizationType,
  useTopicModelExperimentAppState,
} from '../app-state';
import {
  HyperparameterEvaluationInversePlot,
  HyperparameterEvaluationPlot,
} from './visualization/hyperparameter_evaluation_plot';
import {
  EvaluationPerTrialsPlot,
  HyperparameterPerTrialsPlot,
} from './visualization/hyperparameter_per_trial_plot';

const TOPIC_MODEL_EXPERIMENT_RESULT_VISUALIZATION_DICTIONARY = {
  [TopicModelExperimentResultVisualizationType.EvaluationPerHyperparameter]: {
    value:
      TopicModelExperimentResultVisualizationType.EvaluationPerHyperparameter,
    label: 'How a Hyperparameter Affect Topic Evaluations',
    description:
      'Show how the various values of a certain hyperparameter affect the evaluation results.',
  },
  [TopicModelExperimentResultVisualizationType.EvaluationPerTrial]: {
    value: TopicModelExperimentResultVisualizationType.EvaluationPerTrial,
    label: 'Topic Evaluation per Trial',
    description:
      'Show the results of the topic evaluations for every trial, to see the progress of optimizing the topic model hyperparameters.',
  },
  [TopicModelExperimentResultVisualizationType.HyperparameterPerEvaluation]: {
    value:
      TopicModelExperimentResultVisualizationType.HyperparameterPerEvaluation,
    label: 'How Combinations of Hyperparameter Affects Topic Evaluation',
    description:
      'Show how various hyperparameters correlate with each other to maximize the topic evaluations.',
  },
  [TopicModelExperimentResultVisualizationType.HyperparameterPerTrial]: {
    value:
      TopicModelExperimentResultVisualizationType.HyperparameterPerEvaluation,
    label: 'Topic Hyperparameters per Trial',
    description:
      'Show the sampled hyperparameters for every trial, to see the progress of optimizing the topic model hyperparameters.',
  },
};

interface SelectTopicModelExperimentResultVisualizationTypeInputProps {
  value: TopicModelExperimentResultVisualizationType | null;
  onChange: React.Dispatch<
    React.SetStateAction<TopicModelExperimentResultVisualizationType | null>
  >;
}

function SelectTopicModelExperimentResultVisualizationTypeInput(
  props: SelectTopicModelExperimentResultVisualizationTypeInputProps,
) {
  const renderOption = useDescriptionBasedRenderOption(
    TOPIC_MODEL_EXPERIMENT_RESULT_VISUALIZATION_DICTIONARY,
  );
  return (
    <Select
      label="Visualization Method"
      description="Select the method used to visualize the experiment results."
      required
      value={props.value}
      onChange={
        props.onChange as React.Dispatch<React.SetStateAction<string | null>>
      }
      allowDeselect={false}
      renderOption={renderOption}
    />
  );
}

interface TopicModelExperimentSummaryTabProps {
  result: BERTopicExperimentResultModel;
}

export default function TopicModelExperimentSummaryTab(
  props: TopicModelExperimentSummaryTabProps,
) {
  const { result } = props;
  const visualizationMethod = useTopicModelExperimentAppState(
    (store) => store.visualizationMethod,
  );
  const setVisualizationMethod = useTopicModelExperimentAppState(
    (store) => store.setVisualizationMethod,
  );

  return (
    <Stack>
      <SelectTopicModelExperimentResultVisualizationTypeInput
        value={visualizationMethod}
        onChange={setVisualizationMethod}
      />
      {visualizationMethod ===
      TopicModelExperimentResultVisualizationType.EvaluationPerHyperparameter ? (
        <HyperparameterEvaluationInversePlot result={result} />
      ) : visualizationMethod ===
        TopicModelExperimentResultVisualizationType.EvaluationPerTrial ? (
        <EvaluationPerTrialsPlot result={result} />
      ) : visualizationMethod ===
        TopicModelExperimentResultVisualizationType.HyperparameterPerEvaluation ? (
        <HyperparameterEvaluationPlot result={result} />
      ) : visualizationMethod ===
        TopicModelExperimentResultVisualizationType.HyperparameterPerTrial ? (
        <HyperparameterPerTrialsPlot result={result} />
      ) : null}
    </Stack>
  );
}
