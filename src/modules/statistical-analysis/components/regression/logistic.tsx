import { LogisticRegressionResultModel } from '@/api/statistical-analysis';
import {
  RegressionConvergenceResultRenderer,
  RegressionInterceptResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
  usePredictedResultsBaselineLine,
  useRegressionAlphaConstrainedColors,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import { useVisualizationAlphaSlider } from '@/modules/visualization/components/configuration';
import { Group, Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import {
  RegressionModelType,
  RegressionVisualizationTypeEnum,
  useRegressionVisualizationTypeSelect,
} from './types';
import { getRegressionCoefficientsVisualizationData } from './data';
import { ResultCard } from '@/components/visual/result-card';
import { LogisticRegressionConfigType } from '../../configuration/logistic-regression';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { StatisticTestWarningsRenderer } from '../statistic-test/common';
import React from 'react';
import {
  formatConfidenceInterval,
  formatConfidenceLevel,
  pValueToConfidenceLevel,
} from './utils';
import { PlotParams } from 'react-plotly.js';
import { zip } from 'lodash-es';

const LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.PredictionPerIndependentVariable,
];

interface UseLinearRegressionEveryPredictionResultPlotProps {
  data: LogisticRegressionResultModel;
  config: LogisticRegressionConfigType;
  alpha: number;
  type: RegressionVisualizationTypeEnum;
  baseline: number;
}
function useLogisticRegressionPredictionResultPlot(
  props: UseLinearRegressionEveryPredictionResultPlotProps,
) {
  const { data, config, alpha, type, baseline } = props;
  const baselineLayout = usePredictedResultsBaselineLine({
    baseline: baseline,
    percentage: true,
  });
  const colors = useRegressionAlphaConstrainedColors({
    coefficients: data.coefficients,
    alpha,
  });

  const plot = React.useMemo<PlotParams | null>(() => {
    if (
      type !== RegressionVisualizationTypeEnum.PredictionPerIndependentVariable
    ) {
      return null;
    }
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
    colors,
    config.target,
    data.coefficients,
    data.independent_variables,
    data.predictions,
    type,
  ]);
  return plot;
}

export default function LogisticRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType
  >,
) {
  const { data, config } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const visdata = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: data.coefficients,
      modelType: RegressionModelType.Logistic,
    });
  }, [data.coefficients]);

  const vifPlot = useVarianceInflationFactorRegressionResultPlot({
    coefficients: visdata.coefficients,
    type,
  });
  const sampleSizePlot = useSampleSizeRegressionResultPlot({
    coefficients: visdata.coefficients,
    type,
  });
  const commonProps = {
    alpha,
    type,
    data: visdata,
  };
  const coefficientPlot = useCoefficientRegressionResultPlot(commonProps);
  const confidenceLevelPlot =
    useConfidenceLevelRegressionResultPlot(commonProps);
  const oddsRatioPlot = useOddsRatioRegressionResultPlot(commonProps);
  const predictionPlot = useLogisticRegressionPredictionResultPlot({
    baseline: data.baseline_prediction.probability,
    config,
    data,
    alpha,
    type,
  });
  const usedPlot =
    sampleSizePlot ??
    vifPlot ??
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
      {data.intercept && (
        <RegressionInterceptResultRenderer
          intercept={data.intercept}
          reference={data.reference}
          statisticName="T-Statistic"
        />
      )}
      <RegressionConvergenceResultRenderer
        converged={data.fit_evaluation.converged}
      />
      {VisualizationSelect}
      {AlphaSlider}
      {usedPlot && <PlotRenderer plot={usedPlot} height={720} />}
    </Stack>
  );
}
