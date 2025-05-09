import { BERTopicExperimentResultModel } from '@/api/topic';
import { max, min } from 'lodash-es';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { Alert, Group, Stack, useMantineTheme } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import {
  getTrialResultCustomdata,
  useGetHyperparamerPerTrialsBestCoherenceAnnotation,
} from './plot-annotation';
import { useTopicModelExperimentValueTypePlot } from './select-experiment-value';
import { TopicModelExperimentValueType } from '../component/select';

interface HyperparameterPerTrialsPlotProps {
  data: BERTopicExperimentResultModel;
}

export function TopicModelExperimentResultSummaryPlot(
  props: HyperparameterPerTrialsPlotProps,
) {
  const { data } = props;

  const {
    SelectColor,
    SelectX,
    SelectY,
    xConfig,
    yConfig,
    colorConfig,
    trials,
    xType,
    yType,
  } = useTopicModelExperimentValueTypePlot({ data });

  const isLinePlot = xType === TopicModelExperimentValueType.TrialNumber;
  const coherenceLayout = useGetHyperparamerPerTrialsBestCoherenceAnnotation({
    accessorX: xConfig?.accessor,
    accessorY: yConfig?.accessor,
    mode: isLinePlot ? 'line' : 'circle',
    result: data,
  });

  const { colors: mantineColors } = useMantineTheme();
  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (!xConfig || !yConfig || !colorConfig) return;
    if (xType === yType) return;
    const x = trials.map(xConfig.accessor) as number[];
    const y = trials.map(yConfig.accessor) as number[];
    const colorValues = trials.map(colorConfig.accessor);
    const colors = colorValues.map(
      (color) => color ?? mantineColors.red[6],
    ) as number[];
    const { customdata, hovertemplate } = getTrialResultCustomdata(
      data.constraint,
      trials,
    );
    return {
      data: [
        {
          x,
          y,
          type: 'scatter',
          mode: isLinePlot ? 'lines+markers' : 'markers',
          customdata,
          hovertemplate,
          marker: {
            color: colors,
            cmin: min(colorValues) ?? 0,
            cmax: max(colorValues) ?? 0,
            colorscale: 'Viridis',
            colorbar: {
              title: colorConfig.label,
            },
          },
        },
      ],
      layout: {
        title: `Topic Model Experiment Result`,
        xaxis: {
          title: xConfig.label,
        },
        yaxis: {
          title: yConfig.label,
          minallowed: 0,
        },
        ...coherenceLayout,
      },
    };
  }, [
    coherenceLayout,
    colorConfig,
    data.constraint,
    isLinePlot,
    mantineColors.red,
    trials,
    xConfig,
    xType,
    yConfig,
    yType,
  ]);

  return (
    <Stack>
      <Group align="start">
        {SelectX}
        {SelectY}
        {SelectColor}
      </Group>
      {plot ? (
        <PlotRenderer plot={plot} />
      ) : xType === yType ? (
        <Alert title="Invalid axis" color="yellow">
          The data that corresponds to the x axis and y axis is the same. Please
          choose different data for both axes.
        </Alert>
      ) : (
        <Alert title="No data to be visualized" color="yellow">
          Choose the data to be visualized from the select components above.
        </Alert>
      )}
    </Stack>
  );
}
