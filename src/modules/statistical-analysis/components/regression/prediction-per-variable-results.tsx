import {
  LinearRegressionResultModel,
  LogisticRegressionResultModel,
  MultinomialLogisticRegressionResultModel,
  OrdinalRegressionResultModel,
} from '@/api/statistical-analysis';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { transposeMatrix } from '@/common/utils/iterable';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import PlotRenderer from '@/components/widgets/plotly';
import { Stack, Select } from '@mantine/core';
import { zip } from 'lodash-es';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { LogisticRegressionConfigType } from '../../configuration/logistic-regression';
import {
  LinearRegressionConfigType,
  MultinomialLogisticRegressionConfigType,
} from '../../configuration/regression';
import { RegressionConfigType } from '../../configuration/regression-common';
import { usePredictedResultsBaselineLine } from './components';
import { formatConfidenceInterval, pValueToConfidenceLevel } from './utils';

interface LinearRegressionEveryPredictionResultPlotProps {
  data: LinearRegressionResultModel;
  config: LinearRegressionConfigType;
}

export function LinearRegressionPredictionResultPlot(
  props: LinearRegressionEveryPredictionResultPlotProps,
) {
  const { data, config } = props;
  const baselineLayout = usePredictedResultsBaselineLine({
    baseline: data.baseline_prediction.mean,
  });
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.coefficients.map((coefficient) => coefficient.name),
    );

    return {
      data: [
        {
          x: data.independent_variables,
          y: data.predictions.map((prediction) => prediction.mean),
          type: 'bar',
          customdata: zip(
            data.coefficients.map((coefficient) => coefficient.statistic),
            data.coefficients.map((coefficient) =>
              formatConfidenceInterval(coefficient.confidence_interval),
            ),
            data.coefficients.map((coefficient) =>
              pValueToConfidenceLevel(coefficient.p_value),
            ),
          ),
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Predicted Mean</b>: %{y}',
            '<b>Coefficient</b>: %{customdata[0]}',
            '<b>Confidence Interval</b>: %{customdata[1]}',
            '<b>Confidence Level</b>: %{customdata[2]:.3f}%',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: `Predicted Means of ${config.target} per Independent Variable`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: `Predicted Mean`,
        },
        ...baselineLayout,
      },
    } as PlotParams;
  }, [
    data.independent_variables,
    data.predictions,
    data.coefficients,
    config.target,
    baselineLayout,
  ]);
  return <PlotRenderer plot={plot} />;
}

interface LogisticRegressionPredictionResultPlotProps {
  data: LogisticRegressionResultModel;
  config: LogisticRegressionConfigType;
}
export function LogisticRegressionPredictionResultPlot(
  props: LogisticRegressionPredictionResultPlotProps,
) {
  const { data, config } = props;
  const baselineLayout = usePredictedResultsBaselineLine({
    baseline: data.baseline_prediction.probability,
    percentage: true,
  });

  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(data.independent_variables);
    return {
      data: [
        {
          x: data.independent_variables,
          y: data.predictions.map((prediction) => prediction.probability),
          type: 'bar',
          customdata: zip(
            data.coefficients.map((coefficient) => coefficient.odds_ratio),
            data.coefficients.map((coefficient) =>
              formatConfidenceInterval(
                coefficient.odds_ratio_confidence_interval,
              ),
            ),
            data.coefficients.map((coefficient) =>
              pValueToConfidenceLevel(coefficient.p_value),
            ),
          ),
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Predicted Probability</b>: %{y}',
            '<b>Odds Ratio</b>: %{customdata[0]}',
            '<b>Confidence Interval</b>: %{customdata[1]}',
            '<b>Confidence Level</b>: %{customdata[2]:.3f}%',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: `Predicted Probabilities of ${config.target} per Independent Variable`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: `Predicted Probability`,
        },
        ...baselineLayout,
      },
    } as PlotParams;
  }, [
    baselineLayout,
    config.target,
    data.coefficients,
    data.independent_variables,
    data.predictions,
  ]);
  return plot;
}

interface UseMultinomialLogisticRegressionPredictionResultPlotProps {
  data: MultinomialLogisticRegressionResultModel;
  config: MultinomialLogisticRegressionConfigType;
}

export function MultinomialLogisticRegressionPredictionResultPlot(
  props: UseMultinomialLogisticRegressionPredictionResultPlotProps,
) {
  const { data, config } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const x = ['Baseline', ...data.independent_variables];
    const y = data.levels;
    const z = zip(data.baseline_prediction.probabilities, data.predictions).map(
      ([baseline, prediction]) => [
        baseline! * 100,
        ...prediction!.probabilities.map((probability) => probability * 100),
      ],
    );
    const pValues = data.facets.map((facet) =>
      facet.coefficients.map((coefficient) => coefficient.p_value),
    );
    const customdata = zip(
      data.facets.map((facet) => [
        'None',
        ...facet.coefficients.map((coefficient) => coefficient.odds_ratio),
      ]),
      data.facets.map((facet) => [
        'None',
        ...facet.coefficients.map((coefficient) =>
          formatConfidenceInterval(coefficient.odds_ratio_confidence_interval),
        ),
      ]),
      pValues.map((facet) => ['None', ...facet.map(pValueToConfidenceLevel)]),
    );

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
          customdata: customdata as any,
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Dependent Variable Level</b>: %{y}',
            '<b>Predicted Probability</b>: %{z}%',
            '<b>Odds Ratio</b>: %{customdata[0]}',
            '<b>Confidence Interval</b>: %{customdata[1]}',
            '<b>Confidence Level</b>: %{customdata[2]}',
          ].join('<br>'),
        },
      ],
      layout: {
        title: `Predicted Probabilities for Levels of ${config.target}`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: `Dependent Variable Levels`,
        },
      },
    } as PlotParams;
  }, [
    data.independent_variables,
    data.levels,
    data.baseline_prediction.probabilities,
    data.predictions,
    data.facets,
    config.target,
  ]);
  return plot;
}

interface useOrdinalRegressionPredictionResultPlotProps {
  data: OrdinalRegressionResultModel;
  config: RegressionConfigType;
}

enum OrdinalRegressionPredictionDisplay {
  LatentScore = 'latent-score',
  ProbabilityDistribution = 'probability-distribution',
}
const ORDINAL_REGRESSION_PREDICTION_DISPLAY_DICTIONARY = {
  [OrdinalRegressionPredictionDisplay.ProbabilityDistribution]: {
    label: 'Probability Distribution',
    value: OrdinalRegressionPredictionDisplay.ProbabilityDistribution,
    description: 'Show the probabilities of each level.',
  },
  [OrdinalRegressionPredictionDisplay.LatentScore]: {
    label: 'Latent Score',
    value: OrdinalRegressionPredictionDisplay.LatentScore,
    description:
      'Show the latent variable predictions. You can then compare the predicted values to the thresholds to see how much the subdataset is associated with lower/higher ranks.',
  },
};

export function OrdinalRegressionPredictionResultPlot(
  props: useOrdinalRegressionPredictionResultPlotProps,
) {
  const { data, config } = props;
  const [display, setDisplay] = React.useState(
    OrdinalRegressionPredictionDisplay.ProbabilityDistribution,
  );
  const renderOption = useDescriptionBasedRenderOption(
    ORDINAL_REGRESSION_PREDICTION_DISPLAY_DICTIONARY,
  );

  const baselineLayout = usePredictedResultsBaselineLine({
    baseline: data.baseline_prediction.latent_score,
  });
  const latentScorePlot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(data.independent_variables);

    return {
      data: [
        {
          x: data.independent_variables,
          y: data.predictions.map((prediction) => prediction.latent_score),
          type: 'bar',
          customdata: zip(
            data.coefficients.map((coefficient) => coefficient.odds_ratio),
            data.coefficients.map((coefficient) =>
              formatConfidenceInterval(
                coefficient.odds_ratio_confidence_interval,
              ),
            ),
            data.coefficients.map((coefficient) =>
              pValueToConfidenceLevel(coefficient.p_value),
            ),
          ),
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Predicted Mean</b>: %{y}',
            '<b>Odds Ratio</b>: %{customdata[0]}',
            '<b>Confidence Interval</b>: %{customdata[1]}',
            '<b>Confidence Level</b>: %{customdata[2]}%',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: `Predicted Means of ${config.target} per Independent Variable`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: `Predicted Mean`,
        },
        ...baselineLayout,
      },
    } as PlotParams;
  }, [
    data.independent_variables,
    data.predictions,
    data.coefficients,
    config.target,
    baselineLayout,
  ]);

  const probabilityDistributionPlot = React.useMemo<PlotParams>(() => {
    const x = ['Baseline', ...data.independent_variables];
    const y = data.levels;
    const z = transposeMatrix([
      data.baseline_prediction.probabilities,
      ...data.predictions.map((prediction) => prediction.probabilities),
    ]);
    const pValues = data.coefficients.map((coefficient) => coefficient.p_value);
    const customdataRow = zip(
      [
        'None',
        ...data.coefficients.map((coefficient) => coefficient.odds_ratio),
      ],
      [
        'None',
        ...data.coefficients.map(
          (coefficient) => coefficient.odds_ratio_confidence_interval,
        ),
      ],
      ['None', ...pValues.map(pValueToConfidenceLevel)],
    );
    const customdata = data.levels.map(
      () => customdataRow,
    ) as unknown as number[][];

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
          customdata: customdata as any,
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Dependent Variable Level</b>: %{y}',
            '<b>Predicted Probability</b>: %{z}%',
            '<b>Odds Ratio</b>: %{customdata[0]}',
            '<b>Confidence Level</b>: %{customdata[1]}',
          ].join('<br>'),
        },
      ],
      layout: {
        title: `Predicted Probabilities for Levels of ${config.target}`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: `Dependent Variable Levels`,
        },
      },
    } as PlotParams;
  }, [
    data.independent_variables,
    data.levels,
    data.baseline_prediction.probabilities,
    data.predictions,
    data.coefficients,
    config.target,
  ]);

  return (
    <Stack>
      <Select
        label="Display which data?"
        required
        value={display}
        onChange={
          setDisplay as React.Dispatch<React.SetStateAction<string | null>>
        }
        renderOption={renderOption}
        allowDeselect={false}
      />
      <PlotRenderer
        plot={
          display === OrdinalRegressionPredictionDisplay.LatentScore
            ? latentScorePlot
            : probabilityDistributionPlot
        }
      />
    </Stack>
  );
}
