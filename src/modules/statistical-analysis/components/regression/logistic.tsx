import { LogisticRegressionResultModel } from '@/api/statistical-analysis';
import {
  RegressionConvergenceResultRenderer,
  RegressionInterceptResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
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
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { StatisticTestWarningsRenderer } from '../statistic-test/common';
import React from 'react';
import { formatConfidenceLevel } from './utils';

const LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
  RegressionVisualizationTypeEnum.OddsRatio,
];

export default function LogisticRegressionResultRenderer(
  props: BaseStatisticalAnalysisResultRendererProps<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType
  >,
) {
  const { data } = props;
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
  const usedPlot =
    sampleSizePlot ??
    vifPlot ??
    coefficientPlot ??
    confidenceLevelPlot ??
    oddsRatioPlot;
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
