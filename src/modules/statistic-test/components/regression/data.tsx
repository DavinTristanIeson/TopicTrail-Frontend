import { LogisticRegressionCoefficientModel } from '@/api/statistic-test';
import { maybeElement } from '@/common/utils/iterable';
import { zip } from 'lodash-es';
import {
  UltimateRegressionCoefficientModel,
  RegressionModelType,
  REGRESSION_MODEL_QUIRKS,
} from './types';
import { formatConfidenceInterval, pValueToConfidenceLevel } from './utils';

interface RegressionVisualizationDataProps {
  coefficients: UltimateRegressionCoefficientModel[];
  modelType: RegressionModelType;
}

export function getRegressionCoefficientsVisualizationData(
  props: RegressionVisualizationDataProps,
) {
  const { coefficients, modelType } = props;
  const regressionQuirk = REGRESSION_MODEL_QUIRKS[modelType];
  const withOdds = regressionQuirk.withOdds;
  const statisticName = regressionQuirk.statisticName;

  const independentVariables = coefficients.map(
    (coefficient) => coefficient.name,
  );
  const coefficientValues = coefficients.map(
    (coefficient) => coefficient.value,
  );
  const pValues = coefficients.map((coefficient) => coefficient.p_value);
  const confidenceLevels = pValues.map(pValueToConfidenceLevel);
  const sampleSizes = coefficients.map(
    (coefficient) => coefficient.sample_size,
  );
  const confidenceIntervals = coefficients.map(
    (coefficient) => coefficient.confidence_interval,
  );
  const confidenceIntervalStrings = confidenceIntervals.map(
    formatConfidenceInterval,
  );
  const statistics = coefficients.map((coefficient) => coefficient.statistic);
  const standardErrors = coefficients.map((coefficient) => coefficient.std_err);
  const varianceInflationFactors = coefficients.map(
    (coefficient) => coefficient.variance_inflation_factor,
  );
  const oddsRatios = withOdds
    ? null
    : coefficients.map(
        (coefficient) =>
          (coefficient as LogisticRegressionCoefficientModel).odds_ratio,
      );

  const rawCustomdata = [
    independentVariables,
    coefficientValues,
    oddsRatios ?? [],

    pValues,
    confidenceLevels,
    statistics,
    standardErrors,

    sampleSizes,
    varianceInflationFactors,
  ] as any[];

  const customdata = zip(...rawCustomdata);

  const hovertemplate = [
    'Variable: %{customdata[0]}',
    'Coefficient: %{customdata[1]:.3f}',
    'Confidence Interval: %{customdata[2]} (for Alpha = 0.05)',
    ...maybeElement(withOdds, 'Odds Ratio: %{customdata[3]:.3f'),
    '='.repeat(30),
    'P-Value: %{customdata[4]:.3f}',
    'Confidence: %{customdata[5]:.3f})',
    `${statisticName}: %{customdata[6]:.3f}`,
    'Standard Error: %{customdata[7]}',
    '='.repeat(30),
    'Sample Size: %{customdata[8]}',
    'Variance Inflation Factor: %{customdata[9]:.3f}',
  ].join('<br>');
  return {
    customdata,
    hovertemplate,

    statisticName,
    withOdds,
    xaxisTitle: 'Independent Variables (Subdatasets)',

    variables: independentVariables,
    values: coefficientValues,
    coefficients,

    standardErrors,
    pValues,
    confidenceLevels,
    statistics,
    confidenceIntervalStrings,
    sampleSizes,
    varianceInflationFactors,
    oddsRatios: oddsRatios,
  };
}

export type RegressionVisualizationData = ReturnType<
  typeof getRegressionCoefficientsVisualizationData
>;

interface GetRegressionInterceptVisualizationDataProps {
  intercept: UltimateRegressionCoefficientModel;
  modelType: RegressionModelType;
}
export function getRegressionInterceptVisualizationData(
  props: GetRegressionInterceptVisualizationDataProps,
) {
  const { intercept, modelType } = props;

  const interceptOddsRatio = (intercept as LogisticRegressionCoefficientModel)
    .odds_ratio;
  const customdata = [
    [
      intercept.value,
      formatConfidenceInterval(intercept.confidence_interval),
      interceptOddsRatio,

      pValueToConfidenceLevel(intercept.p_value),
      intercept.p_value,
      intercept.statistic,
      intercept.std_err,
    ],
  ];
  const regressionQuirk = REGRESSION_MODEL_QUIRKS[modelType];
  const hovertemplate = [
    'Intercept: %{customdata[0]}',
    'Confidence Interval: %{customdata[6]} (for Alpha = 0.05)',
    ...maybeElement(
      regressionQuirk.withOdds,
      'Odds Ratio: %{customdata[1]:.3f}',
    ),
    '='.repeat(30),
    'Confidence Level: %{customdata[3]:.3f}',
    'P-Value: %{customdata[4]:.3f}',
    `${regressionQuirk.statisticName}: %{customdata[5]:.3f}`,
    'Std. Err: %{customdata[6]:.3f}',
  ].join('<br>');
  return { customdata, hovertemplate };
}
