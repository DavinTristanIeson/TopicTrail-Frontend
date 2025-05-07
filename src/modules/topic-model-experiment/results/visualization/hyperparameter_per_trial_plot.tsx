import { BERTopicExperimentResultModel } from '@/api/topic';
import { max, min } from 'lodash-es';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { Stack, useMantineTheme } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import {
  getTrialResultCustomdata,
  useGetHyperparamerPerTrialsBestCoherenceAnnotation,
} from './utils';
import {
  useTopicEvaluationTypeSelect,
  useTopicModelExperimentHyperparameterTypeSelect,
} from './configuration';

interface HyperparameterPerTrialsPlotProps {
  result: BERTopicExperimentResultModel;
}

export function HyperparameterPerTrialsPlot(
  props: HyperparameterPerTrialsPlotProps,
) {
  const { result } = props;

  const { Component, hyperparameterName, accessor } =
    useTopicModelExperimentHyperparameterTypeSelect(result.constraint);
  const coherenceLayout = useGetHyperparamerPerTrialsBestCoherenceAnnotation({
    accessorX: React.useCallback((trial) => trial.trial_number, []),
    accessorY: accessor,
    mode: 'line',
    result,
  });

  const { colors: mantineColors } = useMantineTheme();
  const plot = React.useMemo<PlotParams>(() => {
    const trials = result.trials
      .slice()
      .sort((a, b) => a.trial_number - b.trial_number);
    const y = trials.map(accessor) as number[];
    const x = trials.map((trial) => trial.trial_number);
    const coherence = trials.map((trial) => trial.evaluation?.coherence_v);
    const { customdata, hovertemplate } = getTrialResultCustomdata(
      result.constraint,
      trials,
    );
    const colors = coherence.map((cv) =>
      cv == null ? mantineColors.red[6] : cv,
    );
    return {
      data: [
        {
          x,
          y,
          type: 'scatter',
          mode: 'lines+markers',
          customdata,
          hovertemplate,
          marker: {
            colors,
            cmin: min(coherence),
            cmax: max(coherence),
            colorscale: 'Greens',
          },
        },
      ],
      layout: {
        title: `${hyperparameterName} per Trial`,
        xaxis: {
          title: 'Trials',
          minallowed: 0,
          maxallowed: (trials[trials.length - 1]?.trial_number ?? 0) + 1,
        },
        yaxis: {
          title: hyperparameterName,
          minallowed: 0,
        },
        ...coherenceLayout,
      },
    };
  }, [
    accessor,
    coherenceLayout,
    hyperparameterName,
    mantineColors.red,
    result.constraint,
    result.trials,
  ]);
  return (
    <Stack>
      {Component}
      <PlotRenderer plot={plot} />
    </Stack>
  );
}

export function EvaluationPerTrialsPlot(
  props: HyperparameterPerTrialsPlotProps,
) {
  const { result } = props;

  const { Component, evaluationName, accessor } =
    useTopicEvaluationTypeSelect();
  const coherenceLayout = useGetHyperparamerPerTrialsBestCoherenceAnnotation({
    accessorX: React.useCallback((trial) => trial.trial_number, []),
    accessorY: accessor,
    mode: 'line',
    result,
  });

  const plot = React.useMemo<PlotParams>(() => {
    const trials = result.trials
      .filter((trial) => trial.evaluation)
      .sort((a, b) => a.trial_number - b.trial_number);
    const y = trials.map(accessor) as number[];
    const x = trials.map((trial) => trial.trial_number);
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
          mode: 'lines+markers',
          customdata,
          hovertemplate,
          marker: {
            colors: y,
            cmin: min(y),
            cmax: max(y),
            colorscale: 'Greens',
          },
        },
      ],
      layout: {
        title: `${evaluationName} per Trial`,
        xaxis: {
          title: 'Trials',
          minallowed: 0,
          maxallowed: (trials[trials.length - 1]?.trial_number ?? 0) + 1,
        },
        yaxis: {
          title: evaluationName,
          minallowed: 0,
        },
        ...coherenceLayout,
      },
    };
  }, [
    accessor,
    coherenceLayout,
    evaluationName,
    result.constraint,
    result.trials,
  ]);
  return (
    <Stack>
      {Component}
      <PlotRenderer plot={plot} />
    </Stack>
  );
}
