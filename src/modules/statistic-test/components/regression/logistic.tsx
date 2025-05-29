import { LogisticRegressionResultModel } from '@/api/statistic-test';
import {
  RegressionConvergenceResultRenderer,
  RegressionInterceptResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useEffectOnInterceptRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
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
import { StatisticTestWarningsRenderer } from '../common';
import React from 'react';
import { formatConfidenceLevel } from './utils';

const LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.EffectOnIntercept,
];

export default function LogisticRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType
  >,
) {
  const { data: rawData, config } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const data = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: rawData.coefficients,
      modelType: RegressionModelType.Logistic,
    });
  }, [rawData.coefficients]);

  const effectOnInterceptPlot = useEffectOnInterceptRegressionResultPlot({
    data,
    type,
    intercept: rawData.intercept!,
    targetName: config.target.name,
    modelType: RegressionModelType.Logistic,
  });
  const vifPlot = useVarianceInflationFactorRegressionResultPlot({
    data,
    type,
  });
  const sampleSizePlot = useSampleSizeRegressionResultPlot({
    data,
    type,
  });
  const commonProps = {
    alpha,
    type,
    data,
  };
  const coefficientPlot = useCoefficientRegressionResultPlot(commonProps);
  const confidenceLevelPlot =
    useConfidenceLevelRegressionResultPlot(commonProps);
  const oddsRatioPlot = useOddsRatioRegressionResultPlot(commonProps);
  const usedPlot =
    sampleSizePlot ??
    vifPlot ??
    effectOnInterceptPlot ??
    coefficientPlot ??
    confidenceLevelPlot ??
    oddsRatioPlot;
  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={rawData.warnings} />
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'Log-Likelihood Ratio'}
          value={rawData.log_likelihood_ratio?.toFixed(3)}
          info="Measures how much better the fitted model explains the data compared to the null model. Higher is better. Consider using the p-value or McFadden's Pseudo R-Squared to interpret the model fit rather than the Log-Likelihood Ratio as they are more interpretable/comparable."
        />
        <ResultCard
          label={'P-Value'}
          value={rawData.p_value?.toFixed(3)}
          info="Under the assumption that the null model is sufficient to explain the dependent variable, what is the likelihood that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={'Confidence Level'}
          value={formatConfidenceLevel(rawData.p_value)}
          info="How confident are we that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={"McFadden's Pseudo R-Squared"}
          value={rawData.pseudo_r_squared?.toFixed(3)}
          info="Measures how much the independent variables help with predicting the dependent variables. McFadden's pseudo R-squared has a scale of 0 to 1, with higher numbers representing a better explanatory power. To be exact, it measures the % improvement in log-likelihood for the fitted model over the null model."
        />
        <ResultCard
          label={'Sample Size'}
          value={rawData.sample_size}
          info="The number of rows used to fit the regression model."
        />
      </Group>
      {rawData.intercept && (
        <RegressionInterceptResultRenderer
          intercept={rawData.intercept}
          reference={rawData.reference}
          statisticName="T-Statistic"
        />
      )}
      <RegressionConvergenceResultRenderer converged={rawData.converged} />
      {VisualizationSelect}
      {AlphaSlider}
      {usedPlot && <PlotRenderer plot={usedPlot} height={720} />}
    </Stack>
  );
}
