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
    ? coefficients.map(
        (coefficient) =>
          (coefficient as LogisticRegressionCoefficientModel).odds_ratio,
      )
    : null;

  const rawCustomdata = [
    independentVariables,
    coefficientValues,
    confidenceIntervalStrings,
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
    '<b>Variable</b>: %{customdata[0]}',
    '<b>Coefficient</b>: %{customdata[1]:.3f}',
    '<b>Confidence Interval</b>: %{customdata[2]} (for Alpha = 0.05)',
    ...maybeElement(withOdds, '<b>Odds Ratio</b>: %{customdata[3]:.3f}'),
    '='.repeat(30),
    '<b>P-Value</b>: %{customdata[4]:.3f}',
    '<b>Confidence</b>: %{customdata[5]:.3f}%',
    `<b>${statisticName}</b>: %{customdata[6]:.3f}`,
    '<b>Standard Error</b>: %{customdata[7]}',
    '='.repeat(30),
    '<b>Sample Size</b>: %{customdata[8]}',
    '<b>Variance Inflation Factor</b>: %{customdata[9]:.3f}',
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
    confidenceIntervals,

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
    '<b>Intercept</b>: %{customdata[0]}',
    '<b>Confidence Interval</b>: %{customdata[1]} (for Alpha = 0.05)',
    ...maybeElement(
      regressionQuirk.withOdds,
      '<b>Odds Ratio</b>: %{customdata[2]:.3f}',
    ),
    '='.repeat(30),
    '<b>Confidence Level</b>: %{customdata[3]:.3f}',
    '<b>P-Value</b>: %{customdata[4]:.3f}',
    `<b>${regressionQuirk.statisticName}</b>: %{customdata[5]:.3f}`,
    '<b>Std. Err</b>: %{customdata[6]:.3f}',
  ].join('<br>');
  return { customdata, hovertemplate };
}
