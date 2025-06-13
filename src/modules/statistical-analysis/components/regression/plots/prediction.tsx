import { formatNumber } from '@/common/utils/number';
import PlotRenderer from '@/components/widgets/plotly';
import { useMantineTheme } from '@mantine/core';
import React from 'react';
import { PlotParams } from 'react-plotly.js';

interface UsePredictedResultsBaselineLineProps {
  baseline: number;
  percentage?: boolean;
}

export function usePredictedResultsBaselineLine(
  props: UsePredictedResultsBaselineLineProps,
) {
  const { baseline, percentage } = props;
  const { colors: mantineColors } = useMantineTheme();
  return React.useMemo<PlotParams['layout']>(() => {
    return {
      annotations: [
        {
          x: 0.1,
          xref: 'paper',
          y: baseline,
          yref: 'y',
          text: `Baseline: ${formatNumber(baseline)}` + (percentage ? '%' : ''),
        },
      ],
      shapes: [
        {
          type: 'line',
          xref: 'paper',
          yref: 'y',
          x0: 0,
          x1: 1,
          y0: baseline,
          y1: baseline,
          line: {
            color: mantineColors.brand[6],
            width: 3,
            dash: 'dash',
          },
        },
      ],
    };
  }, [baseline, mantineColors.brand, percentage]);
}

interface PredictedProbabilityDistributionPlotProps {
  dependentVariableLevels: string[];
  probabilities: number[];
  title?: string;
}

export function PredictedProbabilityDistributionPlot(
  props: PredictedProbabilityDistributionPlotProps,
) {
  const { dependentVariableLevels, probabilities, title } = props;
  const plot = React.useMemo<PlotParams>(() => {
    return {
      data: [
        {
          x: dependentVariableLevels,
          y: probabilities.map((probability) => probability * 100),
          type: 'bar',
          hovertemplate: [
            'Dependent Variable Level: %{x}',
            'Probability: %{y:.3f}%',
          ].join('<br>'),
        },
      ],
      layout: {
        title: title ?? 'Predicted Probability Distribution',
        xaxis: {
          title: 'Levels',
          type: 'category',
        },
        yaxis: {
          title: 'Probability',
          minallowed: 0,
          maxallowed: 100,
          range: [0, 100],
          ticksuffix: '%',
        },
      },
    } as PlotParams;
  }, [dependentVariableLevels, probabilities, title]);
  return <PlotRenderer plot={plot} />;
}
