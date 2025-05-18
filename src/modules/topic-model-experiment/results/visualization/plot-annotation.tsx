import {
  BERTopicExperimentResultModel,
  BERTopicExperimentTrialResultModel,
  BERTopicHyperparameterConstraintModel,
} from '@/api/topic';
import { useMantineTheme } from '@mantine/core';
import { max, zip } from 'lodash-es';
import React from 'react';
import { PlotParams } from 'react-plotly.js';

export function getTrialResultCustomdata(
  constraint: BERTopicHyperparameterConstraintModel,
  result: BERTopicExperimentTrialResultModel[],
) {
  if (!constraint) {
    return {
      customdata: [],
      hovertemplate: undefined,
    };
  }
  const customdata = result.map((trial) => {
    const builder = [];
    builder.push(trial.trial_number);
    builder.push(trial.evaluation?.coherence_v ?? 'None');
    builder.push(trial.evaluation?.topic_diversity ?? 'None');
    builder.push(trial.evaluation?.topics.length ?? 'None');
    if (constraint.max_topics != null) {
      builder.push(trial.candidate.max_topics);
    }
    if (constraint.min_topic_size != null) {
      builder.push(trial.candidate.min_topic_size);
    }
    if (constraint.topic_confidence_threshold != null) {
      builder.push(trial.candidate.topic_confidence_threshold);
    }
    return builder;
  });
  const hovertemplates = [
    '<b>Trial</b>',
    '<b>Coherence</b>',
    '<b>Diversity</b>',
    '<b>Topic Count</b>',
  ];
  if (constraint.max_topics != null) {
    hovertemplates.push('<b>Max. Topics</b>');
  }
  if (constraint.min_topic_size != null) {
    hovertemplates.push('<b>Min. Topic Size</b>');
  }
  if (constraint.topic_confidence_threshold != null) {
    hovertemplates.push('<b>Topic Confidence Threshold</b>');
  }
  const hovertemplate = hovertemplates
    .map((template, index) => `${template}: %{customdata[${index}]}`)
    .join('<br>');
  return { hovertemplate, customdata };
}

type BERTopicExperimentTrialResultAccessor =
  | ((trial: BERTopicExperimentTrialResultModel) => number | null | undefined)
  | undefined;
interface UseGetHyperparamerPerTrialsBestCoherenceAnnotationProps {
  result: BERTopicExperimentResultModel;
  accessorX: BERTopicExperimentTrialResultAccessor;
  accessorY: BERTopicExperimentTrialResultAccessor;
  mode: 'line' | 'circle';
}

export function useGetHyperparamerPerTrialsBestCoherenceAnnotation(
  props: UseGetHyperparamerPerTrialsBestCoherenceAnnotationProps,
) {
  const { result, accessorX, accessorY, mode } = props;
  const { colors: mantineColors } = useMantineTheme();
  return React.useMemo<PlotParams['layout'] | undefined>(() => {
    if (!accessorX || !accessorY) return undefined;
    const trials = result.trials
      .filter((trial) => !!trial.evaluation)
      .sort((a, b) => b.evaluation!.coherence_v - a.evaluation!.coherence_v);
    const xvalues = trials.map(accessorX);
    const yvalues = trials.map(accessorY);
    const best = trials[0];
    if (!best) return undefined;
    const x = accessorX(best);
    const y = accessorY(best);
    if (x == null || y == null) return undefined;
    const radius = max(
      zip(xvalues, yvalues)
        .map(([x2, y2]) => {
          return Math.sqrt(Math.pow(x - x2!, 2) + Math.pow(y - y2!, 2));
        })
        .filter((x) => x > 0)
        .sort((a, b) => a - b)
        .slice(3),
    );
    const annotations = [
      {
        x: x,
        xref: 'x',
        y: y,
        yref: 'y',
        text: 'Best Coherence',
      },
    ] as PlotParams['layout']['annotations'];
    const commonLineShape = {
      color: mantineColors.green[6],
      width: 3,
      dash: 'dash',
    };
    const shapes = (
      mode === 'line'
        ? [
            {
              type: 'line',
              xref: 'paper',
              yref: 'y',
              x0: 0,
              x1: 1,
              y0: y,
              y1: y,
              line: commonLineShape,
            },
            {
              type: 'line',
              xref: 'x',
              yref: 'paper',
              x0: x,
              x1: x,
              y0: 0,
              y1: 1,
              line: commonLineShape,
            },
          ]
        : mode === 'circle' && radius != null
          ? [
              {
                xref: 'x',
                yref: 'y',
                x0: x,
                x1: x,
                y0: y,
                y1: y,
                type: 'circle',
                line: commonLineShape,
              },
            ]
          : undefined
    ) as PlotParams['layout']['shapes'];
    return {
      annotations,
      shapes,
    };
  }, [accessorX, accessorY, mantineColors.green, mode, result.trials]);
}
