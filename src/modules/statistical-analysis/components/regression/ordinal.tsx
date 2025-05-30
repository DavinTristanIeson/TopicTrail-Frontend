import {
  OrdinalRegressionThresholdModel,
  OrdinalRegressionResultModel,
  OrdinalRegressionSampleSizeModel,
} from '@/api/statistical-analysis';
import {
  RegressionConvergenceResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
  usePredictedResultsBaselineLine,
  useRegressionAlphaConstrainedColors,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import { useVisualizationAlphaSlider } from '@/modules/visualization/components/configuration';
import { Group, Select, Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import { getRegressionCoefficientsVisualizationData } from './data';
import {
  RegressionModelType,
  RegressionVisualizationTypeEnum,
  useRegressionVisualizationTypeSelect,
} from './types';
import { PlotParams } from 'react-plotly.js';
import React from 'react';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { RegressionConfigType } from '../../configuration/regression-common';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { ResultCard } from '@/components/visual/result-card';
import { StatisticTestWarningsRenderer } from '../statistic-test/common';
import { zip } from 'lodash-es';
import {
  formatConfidenceInterval,
  formatConfidenceLevel,
  pValueToConfidenceLevel,
} from './utils';
import { ToggleVisibility } from '@/components/visual/toggle-visibility';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { mask2D, transposeMatrix } from '@/common/utils/iterable';

const ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
  RegressionVisualizationTypeEnum.SampleSize,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.VarianceInflationFactor,
  RegressionVisualizationTypeEnum.PredictionPerIndependentVariable,
  RegressionVisualizationTypeEnum.LevelSampleSize,
];

interface useOrdinalRegressionPredictionResultPlotProps {
  data: OrdinalRegressionResultModel;
  config: RegressionConfigType;
  type: RegressionVisualizationTypeEnum;
  alpha: number;
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

function useOrdinalRegressionPredictionResultPlot(
  props: useOrdinalRegressionPredictionResultPlotProps,
) {
  const { data, config, type, alpha } = props;
  const [display, setDisplay] = React.useState(
    OrdinalRegressionPredictionDisplay.ProbabilityDistribution,
  );
  const renderOption = useDescriptionBasedRenderOption(
    ORDINAL_REGRESSION_PREDICTION_DISPLAY_DICTIONARY,
  );
  const SelectComponent = (
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
  );

  const colors = useRegressionAlphaConstrainedColors({
    coefficients: data.coefficients,
    alpha,
  });
  const baselineLayout = usePredictedResultsBaselineLine({
    baseline: data.baseline_prediction.latent_score,
  });
  const latentScorePlot = React.useMemo<PlotParams | null>(() => {
    if (
      type !==
        RegressionVisualizationTypeEnum.PredictionPerIndependentVariable ||
      display !== OrdinalRegressionPredictionDisplay.LatentScore
    ) {
      return null;
    }

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
    type,
    display,
    data.independent_variables,
    data.predictions,
    data.coefficients,
    colors,
    config.target,
    baselineLayout,
  ]);

  const probabilityDistributionPlot = React.useMemo<PlotParams | null>(() => {
    if (
      type !==
        RegressionVisualizationTypeEnum.PredictionPerIndependentVariable ||
      display !== OrdinalRegressionPredictionDisplay.ProbabilityDistribution
    ) {
      return null;
    }

    const x = ['Baseline', ...data.independent_variables];
    const y = data.levels;
    const z = transposeMatrix([
      data.baseline_prediction.probabilities,
      ...data.predictions.map((prediction) => prediction.probabilities),
    ]);
    const pValues = data.coefficients.map((coefficient) => coefficient.p_value);
    const invalidMask = data.levels.map(() => [
      true,
      ...pValues.map((pvalue) => pvalue > alpha),
    ]);
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
          z: mask2D(z, invalidMask, undefined),
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
    type,
    display,
    data.independent_variables,
    data.levels,
    data.baseline_prediction.probabilities,
    data.predictions,
    data.coefficients,
    config.target,
    alpha,
  ]);
  return {
    plot: latentScorePlot ?? probabilityDistributionPlot,
    Component: SelectComponent,
  };
}

interface OrdinalRegressionCutpointsRendererProps {
  thresholds: OrdinalRegressionThresholdModel[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OrdinalRegressionThresholdsRenderer(
  props: OrdinalRegressionCutpointsRendererProps,
) {
  const { thresholds } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const thresholdNames = thresholds.map(
      (threshold) => `${threshold.from_level} - ${threshold.to_level}`,
    );
    const thresholdValues = thresholds.map((cutpoint) => cutpoint.value);
    const { colors } = generateColorsFromSequence(thresholdNames);

    return {
      data: [
        {
          type: 'bar',
          x: thresholdNames,
          y: thresholdValues,
          marker: {
            color: colors,
          },
          customdata: zip(
            thresholds.map((threshold) => threshold.from_level),
            thresholds.map((threshold) => threshold.to_level),
          ),
          hovertemplate: [
            '<b>Level</b>: %{x}',
            '<b>Threshold</b>: %{y:.3f}',
            `<b>From</b>: %{customdata[0]}`,
            `<b>To</b>: %{customdata[1]}`,
          ].join('<br>'),
        },
      ],
      layout: {
        height: 300,
        title: 'Thresholds of the Dependent Variable Levels',
        xaxis: {
          title: 'Thresholds',
        },
        yaxis: {
          title: 'Levels',
        },
        barmode: 'stack',
      },
    } as PlotParams;
  }, [thresholds]);

  return (
    <ToggleVisibility label="Thresholds" defaultVisible>
      <div className="w-full">
        <PlotRenderer plot={plot} />
      </div>
    </ToggleVisibility>
  );
}

interface UseOrdinalRegressionSampleSizePlotProps {
  sampleSizes: OrdinalRegressionSampleSizeModel[];
  type: RegressionVisualizationTypeEnum;
}

function useOrdinalRegressionDependentVariableLevelSampleSizePlot(
  props: UseOrdinalRegressionSampleSizePlotProps,
) {
  const { sampleSizes, type } = props;
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.LevelSampleSize) {
      return null;
    }
    const x = sampleSizes.map((size) => size.name);
    return {
      data: [
        {
          x: x,
          y: sampleSizes.map((size) => size.sample_size),
          type: 'bar',
          marker: {
            color: generateColorsFromSequence(x).colors,
          },
          hovertemplate: ['Level: %{x}', 'Sample Size: %{y}'].join('<br>'),
        },
      ],
      layout: {
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: 'Sample Size',
          minallowed: 0,
        },
      },
    } as PlotParams;
  }, [sampleSizes, type]);
  return plot;
}

export default function OrdinalRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    OrdinalRegressionResultModel,
    RegressionConfigType
  >,
) {
  const { data, config } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const visdata = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: data.coefficients,
      modelType: RegressionModelType.Ordinal,
    });
  }, [data.coefficients]);

  const commonProps = {
    alpha,
    type,
    data: visdata,
  };
  const coefficientPlot = useCoefficientRegressionResultPlot(commonProps);
  const confidenceLevelPlot =
    useConfidenceLevelRegressionResultPlot(commonProps);
  const oddsRatioPlot = useOddsRatioRegressionResultPlot({
    ...commonProps,
    layout: {
      yaxis: {
        title: 'Odds Ratio in Lower/Equal Rank (Log-Scaled)',
      },
    },
  });
  const vifPlot = useVarianceInflationFactorRegressionResultPlot({
    coefficients: visdata.coefficients,
    type,
  });
  const sampleSizePlot = useSampleSizeRegressionResultPlot({
    coefficients: visdata.coefficients,
    type,
  });
  const dependentVariableSampleSizePlot =
    useOrdinalRegressionDependentVariableLevelSampleSizePlot({
      sampleSizes: data.sample_sizes,
      type,
    });
  const { plot: predictionPlot, Component: PredictionDisplaySelect } =
    useOrdinalRegressionPredictionResultPlot({
      alpha,
      config,
      data,
      type,
    });
  const usedPlot =
    sampleSizePlot ??
    vifPlot ??
    dependentVariableSampleSizePlot ??
    coefficientPlot ??
    confidenceLevelPlot ??
    oddsRatioPlot ??
    predictionPlot;

  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={data.warnings} />
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'Log-Likelihood Ratio'}
          value={data.fit_evaluation.log_likelihood_ratio?.toFixed(3)}
          info="Measures how much better the fitted model explains the data compared to the null model. Higher is better. Consider using the p-value or McFadden's Pseudo R-Squared to interpret the model fit rather than the Log-Likelihood Ratio as they are more interpretable/comparable."
        />
        <ResultCard
          label={'P-Value'}
          value={data.fit_evaluation.p_value?.toFixed(3)}
          info="Under the assumption that the null model is sufficient to explain the dependent variable, what is the likelihood that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={'Confidence Level'}
          value={formatConfidenceLevel(data.fit_evaluation.p_value)}
          info="How confident are we that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={"McFadden's Pseudo R-Squared"}
          value={data.fit_evaluation.pseudo_r_squared?.toFixed(3)}
          info="Measures how much the independent variables help with predicting the dependent variables. McFadden's pseudo R-squared has a scale of 0 to 1, with higher numbers representing a better explanatory power. To be exact, it measures the % improvement in log-likelihood for the fitted model over the null model."
        />
        <ResultCard
          label={'Sample Size'}
          value={data.sample_size}
          info="The number of rows used to fit the regression model."
        />
      </Group>
      {data.reference && (
        <ResultCard
          label={'Reference'}
          value={data.reference}
          info="The independent variable used as the reference variable."
        />
      )}
      <RegressionConvergenceResultRenderer
        converged={data.fit_evaluation.converged}
      />
      {VisualizationSelect}
      {AlphaSlider}
      <OrdinalRegressionThresholdsRenderer thresholds={data.thresholds} />
      {PredictionDisplaySelect}
      <div>{usedPlot && <PlotRenderer plot={usedPlot} height={720} />}</div>
    </Stack>
  );
}
