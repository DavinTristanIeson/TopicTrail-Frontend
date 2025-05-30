import {
  OrdinalRegressionThresholdModel,
  OrdinalRegressionResultModel,
  OrdinalRegressionSampleSizeModel,
} from '@/api/statistic-test';
import {
  RegressionConvergenceResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import { useVisualizationAlphaSlider } from '@/modules/visualization/components/configuration';
import { Group, Stack } from '@mantine/core';
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
import { formatConfidenceLevel } from './utils';
import { ToggleVisibility } from '@/components/visual/toggle-visibility';

const ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
  RegressionVisualizationTypeEnum.SampleSize,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.VarianceInflationFactor,
  RegressionVisualizationTypeEnum.LevelSampleSize,
];

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
  const { data: rawData } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const data = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: rawData.coefficients,
      modelType: RegressionModelType.Ordinal,
    });
  }, [rawData.coefficients]);

  const commonProps = {
    alpha,
    type,
    data,
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
    data,
    type,
  });
  const sampleSizePlot = useSampleSizeRegressionResultPlot({
    data,
    type,
  });
  const dependentVariableSampleSizePlot =
    useOrdinalRegressionDependentVariableLevelSampleSizePlot({
      sampleSizes: rawData.sample_sizes,
      type,
    });
  const usedPlot =
    sampleSizePlot ??
    vifPlot ??
    dependentVariableSampleSizePlot ??
    coefficientPlot ??
    confidenceLevelPlot ??
    oddsRatioPlot;

  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={rawData.warnings} />
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'Log-Likelihood Ratio'}
          value={rawData.fit_evaluation.log_likelihood_ratio?.toFixed(3)}
          info="Measures how much better the fitted model explains the data compared to the null model. Higher is better. Consider using the p-value or McFadden's Pseudo R-Squared to interpret the model fit rather than the Log-Likelihood Ratio as they are more interpretable/comparable."
        />
        <ResultCard
          label={'P-Value'}
          value={rawData.fit_evaluation.p_value?.toFixed(3)}
          info="Under the assumption that the null model is sufficient to explain the dependent variable, what is the likelihood that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={'Confidence Level'}
          value={formatConfidenceLevel(rawData.fit_evaluation.p_value)}
          info="How confident are we that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={"McFadden's Pseudo R-Squared"}
          value={rawData.fit_evaluation.pseudo_r_squared?.toFixed(3)}
          info="Measures how much the independent variables help with predicting the dependent variables. McFadden's pseudo R-squared has a scale of 0 to 1, with higher numbers representing a better explanatory power. To be exact, it measures the % improvement in log-likelihood for the fitted model over the null model."
        />
        <ResultCard
          label={'Sample Size'}
          value={rawData.sample_size}
          info="The number of rows used to fit the regression model."
        />
      </Group>
      {rawData.reference && (
        <ResultCard
          label={'Reference'}
          value={rawData.reference}
          info="The independent variable used as the reference variable."
        />
      )}
      <RegressionConvergenceResultRenderer
        converged={rawData.fit_evaluation.converged}
      />
      {VisualizationSelect}
      {AlphaSlider}
      <OrdinalRegressionThresholdsRenderer thresholds={rawData.thresholds} />
      <div>{usedPlot && <PlotRenderer plot={usedPlot} height={720} />}</div>
    </Stack>
  );
}
