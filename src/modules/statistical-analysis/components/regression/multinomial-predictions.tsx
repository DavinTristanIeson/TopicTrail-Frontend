import React from 'react';
import { PlotParams } from 'react-plotly.js';
import {
  MultinomialLogisticRegressionPredictionResultModel,
  OrdinalRegressionPredictionResultModel,
} from '@/api/statistical-analysis';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { Select, Stack, Switch } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import PlotRenderer from '@/components/widgets/plotly';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

type MultinomialPrediction =
  | MultinomialLogisticRegressionPredictionResultModel
  | OrdinalRegressionPredictionResultModel;
interface NamedMultinomialPrediction {
  variable: string;
  prediction: MultinomialPrediction;
}

interface UseMultinomialPredictionProbabilityDistributionBarChartPlotProps {
  baselinePrediction: MultinomialPrediction;
  predictions: NamedMultinomialPrediction[];
  cumulative: boolean;
  target: string;
  type: 'bar' | 'line';
}

function useMultinomialPredictionProbabilityDistributionBarChartPlot(
  props: UseMultinomialPredictionProbabilityDistributionBarChartPlotProps,
) {
  const {
    baselinePrediction,
    predictions: variablePredictions,
    cumulative,
    target,
    type,
  } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const predictions = [
      { variable: 'Baseline', prediction: baselinePrediction },
    ].concat(variablePredictions);
    const { colorMap } = generateColorsFromSequence(
      predictions.map((prediction) => prediction.variable),
    );
    const traces = predictions.map(({ variable, prediction }) => {
      const x = prediction.levels;
      const rawProbabilities = cumulative
        ? (prediction as OrdinalRegressionPredictionResultModel)
            .cumulative_probabilities
        : prediction.probabilities;
      const y = rawProbabilities.map((probability) => probability * 100);
      return {
        name: variable,
        x,
        y,
        type: type,
        marker: {
          color: colorMap.get(variable),
        },
        hovertemplate: [
          `<b>Independent Variable</b>: ${variable}`,
          '<b>Dependent Variable Level</b>: %{x}',
          '<b>Predicted Probability</b>: %{y:.3f}%',
        ].join('<br>'),
      } as PlotParams['data'][number];
    });

    return {
      data: traces,
      layout: {
        title: `${cumulative ? 'Cumulative' : 'Predicted'} Probabilities for Levels of ${target}`,
        xaxis: {
          title: 'Dependent Variable Levels',
          type: 'category',
        },
        yaxis: {
          title: `${cumulative ? 'Cumulative' : 'Predicted'} Probability (%)`,
          minallowed: 0,
          maxallowed: 100,
          range: [0, 100],
          ticksuffix: '%',
        },
      },
    } as PlotParams;
  }, [baselinePrediction, cumulative, target, type, variablePredictions]);
  return plot;
}

interface UseMultinomialPredictionProbabilityDistributionHeatmapPlotProps {
  baselinePrediction: MultinomialPrediction;
  predictions: NamedMultinomialPrediction[];
  levels: {
    name: string;
  }[];
  cumulative: boolean;
  target: string;
}
function useMultinomialPredictionProbabilityDistributionHeatmapPlot(
  props: UseMultinomialPredictionProbabilityDistributionHeatmapPlotProps,
) {
  const {
    baselinePrediction,
    predictions: variablePredictions,
    cumulative,
    levels,
    target,
  } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const predictions = [
      { variable: 'Baseline', prediction: baselinePrediction },
    ].concat(variablePredictions);
    // During prediction, the model returns the distribution for all (although coefficients is always levels - 1)
    const y = predictions.map((prediction) => prediction.variable);
    const x = levels.map((level) => level.name);

    const z = predictions.map(({ prediction }) => {
      const probabilities = cumulative
        ? (prediction as OrdinalRegressionPredictionResultModel)
            .cumulative_probabilities
        : prediction.probabilities;
      return probabilities.map((probability) => probability * 100);
    });

    return {
      data: [
        {
          x,
          y,
          z,
          zmin: 0,
          zmax: 100,
          type: 'heatmap',
          texttemplate: '%{z:.3f}%',
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Dependent Variable Level</b>: %{y}',
            '<b>Predicted Probability</b>: %{z:.3f}%',
          ].join('<br>'),
        },
      ],
      layout: {
        title: `${cumulative ? 'Cumulative' : 'Predicted'} Probabilities for Levels of ${target}`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
          type: 'category',
        },
        yaxis: {
          title: `Dependent Variable Levels`,
          autorange: 'reversed',
          type: 'category',
        },
      },
    } as PlotParams;
  }, [baselinePrediction, cumulative, levels, target, variablePredictions]);
  return plot;
}

enum MultinomialPredictionVisualizationType {
  Heatmap = 'heatmap',
  BarChart = 'bar-chart',
  LinePlot = 'line-plot',
}

const MULTINOMIAL_PREDICTION_VISUALIZATION_TYPE_DICTIONARY = {
  [MultinomialPredictionVisualizationType.Heatmap]: {
    label: 'Heatmap',
    value: MultinomialPredictionVisualizationType.Heatmap,
    description:
      'Show the probability distribution of each independent variable as a heatmap. Use this when you want to get a quick overview of the distribution shapes or identify anomalies in the probability distribution.',
  },
  [MultinomialPredictionVisualizationType.BarChart]: {
    label: 'Bar Chart',
    value: MultinomialPredictionVisualizationType.BarChart,
    description:
      'Show the probability distribution of each independent variable as a grouped bar chart. Use this if you want to compare the probabilities for only a few independent variables at once.',
  },
  [MultinomialPredictionVisualizationType.LinePlot]: {
    label: 'Line Plot',
    value: MultinomialPredictionVisualizationType.LinePlot,
    description:
      'Show the probability distribution of each independent variable as a line plot. Use this if you want to compare the shape of the probability distribution for many independent variables at once.',
  },
};

interface UseMultinomialPredictionPlotProps {
  baselinePrediction: MultinomialPrediction;
  predictions: NamedMultinomialPrediction[];
  levels: {
    name: string;
  }[];
  target: string;
  supportsCumulative: boolean;
}

export function MultinomialPredictionPlot(
  props: UseMultinomialPredictionPlotProps,
) {
  const {
    baselinePrediction,
    predictions,
    levels,
    target,
    supportsCumulative,
  } = props;

  const [display, setDisplay] = React.useState(
    MultinomialPredictionVisualizationType.Heatmap,
  );
  const [cumulative, { toggle }] = useDisclosure(false);
  const barOrLinePlot =
    useMultinomialPredictionProbabilityDistributionBarChartPlot({
      baselinePrediction,
      cumulative,
      predictions,
      target,
      type:
        display === MultinomialPredictionVisualizationType.LinePlot
          ? 'line'
          : 'bar',
    });
  const heatmapPlot =
    useMultinomialPredictionProbabilityDistributionHeatmapPlot({
      baselinePrediction,
      cumulative,
      predictions,
      target,
      levels,
    });

  const usedPlot: PlotParams =
    display === MultinomialPredictionVisualizationType.Heatmap
      ? heatmapPlot
      : barOrLinePlot;
  const renderOption = useDescriptionBasedRenderOption(
    MULTINOMIAL_PREDICTION_VISUALIZATION_TYPE_DICTIONARY,
  );

  return (
    <Stack>
      <Select
        label="Display as"
        data={Object.values(
          MULTINOMIAL_PREDICTION_VISUALIZATION_TYPE_DICTIONARY,
        )}
        required
        value={display}
        onChange={
          setDisplay as React.Dispatch<React.SetStateAction<string | null>>
        }
        renderOption={renderOption}
      />
      {supportsCumulative ? (
        <Switch
          label="Show cumulative probabilities?"
          checked={cumulative}
          onChange={() => toggle()}
        />
      ) : undefined}
      <div>
        <PlotRenderer
          key={display}
          plot={usedPlot}
          scrollZoom={usedPlot !== heatmapPlot}
        />
      </div>
    </Stack>
  );
}
