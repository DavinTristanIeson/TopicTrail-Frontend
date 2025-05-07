import { BERTopicExperimentResultModel } from '@/api/topic';
import { max, min } from 'lodash-es';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { Group, Stack, useMantineTheme } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import {
  getTrialResultCustomdata,
  useGetHyperparamerPerTrialsBestCoherenceAnnotation,
} from './utils';
import {
  useTopicEvaluationTypeMultiSelect,
  useTopicEvaluationTypeSelect,
  useTopicModelExperimentHyperparameterTypeMultiSelect,
  useTopicModelExperimentHyperparameterTypeSelect,
} from './configuration';

interface HyperparameterEvaluationPlotProps {
  result: BERTopicExperimentResultModel;
}

export function HyperparameterEvaluationPlot(
  props: HyperparameterEvaluationPlotProps,
) {
  const { result } = props;

  const {
    Component: HyperparameterSelect,
    hyperparameterNameX,
    hyperparameterNameY,
    hyperparameters,
    accessorX: accessHyperparameterX,
    accessorY: accessHyperparameterY,
  } = useTopicModelExperimentHyperparameterTypeMultiSelect(result.constraint);
  const {
    Component: TopicEvaluationSelect,
    accessor: accessEvaluation,
    evaluationName,
  } = useTopicEvaluationTypeSelect();
  const coherenceLayout = useGetHyperparamerPerTrialsBestCoherenceAnnotation({
    accessorX: accessHyperparameterX,
    accessorY:
      hyperparameters.length === 2 ? accessHyperparameterY : accessEvaluation,
    mode: hyperparameters.length === 2 ? 'circle' : 'line',
    result,
  });

  const { colors: mantineColors } = useMantineTheme();

  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (hyperparameters.length === 0) {
      return undefined;
    }
    let trials = result.trials.sort((a, b) => a.trial_number - b.trial_number);
    let x: number[];
    let y: number[];
    let xaxisTitle: string;
    let yaxisTitle: string;
    if (hyperparameters.length === 1) {
      trials = trials.filter((trial) => !!trial.evaluation);
      x = trials.map(accessHyperparameterX) as number[];
      y = trials.map(accessEvaluation) as number[];
      xaxisTitle = hyperparameterNameX;
      yaxisTitle = hyperparameterNameY;
    } else if (hyperparameters.length >= 2) {
      x = trials.map(accessHyperparameterX) as number[];
      y = trials.map(accessHyperparameterY) as number[];
      xaxisTitle = hyperparameterNameX;
      yaxisTitle = hyperparameterNameY;
    } else {
      throw new Error(
        `Invalid hyperparameter count: ${hyperparameters.length}`,
      );
    }
    const evaluation = trials.map(accessEvaluation);
    const colors = evaluation.map((color) =>
      color == null ? mantineColors.red[6] : color,
    );

    const { customdata, hovertemplate } = getTrialResultCustomdata(
      result.constraint,
      trials,
    );
    return {
      data: [
        {
          x,
          y,
          type: 'scatter',
          mode: 'markers',
          customdata,
          hovertemplate,
          marker: {
            colors,
            cmin: min(evaluation),
            cmax: max(evaluation),
            colorscale: 'Greens',
          },
        },
      ],
      layout: {
        title: `${evaluationName} From Candidates of ${[hyperparameterNameX, hyperparameterNameY].filter(Boolean).join(' and ')}`,
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title: yaxisTitle,
        },
        ...coherenceLayout,
      },
    };
  }, [
    accessEvaluation,
    accessHyperparameterX,
    accessHyperparameterY,
    coherenceLayout,
    evaluationName,
    hyperparameterNameX,
    hyperparameterNameY,
    hyperparameters.length,
    mantineColors.red,
    result.constraint,
    result.trials,
  ]);
  return (
    <Stack>
      <Group align="start">
        {HyperparameterSelect}
        {TopicEvaluationSelect}
      </Group>
      {plot && <PlotRenderer plot={plot} />}
    </Stack>
  );
}

export function HyperparameterEvaluationInversePlot(
  props: HyperparameterEvaluationPlotProps,
) {
  const { result } = props;

  const {
    Component: HyperparameterSelect,
    accessor: accessHyperparameter,
    hyperparameterName,
  } = useTopicModelExperimentHyperparameterTypeSelect(result.constraint);
  const {
    Component: TopicEvaluationSelect,
    accessorX: accessEvaluationX,
    accessorY: accessEvaluationY,
    evaluationNameX,
    evaluationNameY,
    evaluationTypes,
  } = useTopicEvaluationTypeMultiSelect();
  const coherenceLayout = useGetHyperparamerPerTrialsBestCoherenceAnnotation({
    accessorX: accessEvaluationX,
    accessorY:
      evaluationTypes.length === 2 ? accessEvaluationY : accessHyperparameter,
    mode: evaluationTypes.length === 2 ? 'circle' : 'line',
    result,
  });

  const { colors: mantineColors } = useMantineTheme();

  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (evaluationTypes.length === 0) {
      return undefined;
    }
    let trials = result.trials.sort((a, b) => a.trial_number - b.trial_number);
    let x: number[];
    let y: number[];
    let xaxisTitle: string;
    let yaxisTitle: string;
    if (evaluationTypes.length === 1) {
      trials = trials.filter((trial) => !!trial.evaluation);
      x = trials.map(accessHyperparameter) as number[];
      y = trials.map(accessEvaluationX) as number[];
      xaxisTitle = evaluationNameX;
      yaxisTitle = hyperparameterName;
    } else if (evaluationTypes.length >= 2) {
      x = trials.map(accessEvaluationX) as number[];
      y = trials.map(accessEvaluationY) as number[];
      xaxisTitle = evaluationNameX;
      yaxisTitle = evaluationNameY;
    } else {
      throw new Error(
        `Invalid evaluation types count: ${evaluationTypes.length}`,
      );
    }
    const hyperparameters = trials.map(accessHyperparameter) as number[];
    const colors = hyperparameters.map((color) =>
      color == null ? mantineColors.red[6] : color,
    );

    const { customdata, hovertemplate } = getTrialResultCustomdata(
      result.constraint,
      trials,
    );
    return {
      data: [
        {
          x,
          y,
          type: 'scatter',
          mode: 'markers',
          customdata,
          hovertemplate,
          marker: {
            colors,
            cmin: min(hyperparameters),
            cmax: max(hyperparameters),
            colorscale: 'Greens',
          },
        },
      ],
      layout: {
        title: `${[evaluationNameX, evaluationNameY].filter(Boolean).join(' and ')} of ${hyperparameterName}`,
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title: yaxisTitle,
        },
        ...coherenceLayout,
      },
    };
  }, [
    accessEvaluationX,
    accessEvaluationY,
    accessHyperparameter,
    coherenceLayout,
    evaluationNameX,
    evaluationNameY,
    evaluationTypes.length,
    hyperparameterName,
    mantineColors.red,
    result.constraint,
    result.trials,
  ]);
  return (
    <Stack>
      <Group align="start">
        {HyperparameterSelect}
        {TopicEvaluationSelect}
      </Group>
      {plot && <PlotRenderer plot={plot} />}
    </Stack>
  );
}
