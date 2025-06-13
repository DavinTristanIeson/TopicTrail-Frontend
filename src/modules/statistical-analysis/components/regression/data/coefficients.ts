import { LogisticRegressionCoefficientModel } from '@/api/statistical-analysis';
import { maybeElement } from '@/common/utils/iterable';
import { zip } from 'lodash-es';
import {
  UltimateRegressionCoefficientModel,
  RegressionModelType,
  REGRESSION_MODEL_QUIRKS,
} from '../types';
import { pValueToConfidenceLevel, formatConfidenceInterval } from '../utils';

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
  const confidenceIntervals = coefficients.map(
    (coefficient) => coefficient.confidence_interval,
  );
  const confidenceIntervalStrings = confidenceIntervals.map(
    formatConfidenceInterval,
  );
  const statistics = coefficients.map((coefficient) => coefficient.statistic);
  const standardErrors = coefficients.map((coefficient) => coefficient.std_err);
  const oddsRatios = withOdds
    ? coefficients.map(
        (coefficient) =>
          (coefficient as LogisticRegressionCoefficientModel).odds_ratio,
      )
    : null;
  const oddsRatioConfidenceIntervals = withOdds
    ? coefficients.map(
        (coefficient) =>
          (coefficient as LogisticRegressionCoefficientModel)
            .odds_ratio_confidence_interval,
      )
    : null;
  const oddsRatioConfidenceIntervalStrings = oddsRatioConfidenceIntervals?.map(
    formatConfidenceInterval,
  );

  const rawCustomdata = [
    independentVariables,
    coefficientValues.map((value) => value ?? '-'),
    confidenceIntervalStrings,
    oddsRatios?.map((value) => value ?? '-') ?? [],
    oddsRatioConfidenceIntervalStrings ?? [],

    pValues.map((value) => value ?? '-'),
    confidenceLevels.map((value) =>
      value == null || isNaN(value) ? '-' : value,
    ),
    statistics.map((value) => value ?? '-'),
    standardErrors.map((value) => value ?? '-'),
  ] as any[];

  const customdata = zip(...rawCustomdata);

  const hovertemplate = [
    '<b>Variable</b>: %{customdata[0]}',
    '<b>Coefficient</b>: %{customdata[1]:.3f}',
    '<b>Confidence Interval</b>: %{customdata[2]} (for Alpha = 0.05)',
    ...maybeElement(withOdds, [
      '='.repeat(30),
      '<b>Odds Ratio</b>: %{customdata[3]:.3f}',
      '<b>Confidence Interval</b>: %{customdata[4]}',
    ]),
    '='.repeat(30),
    '<b>P-Value</b>: %{customdata[5]:.3f}',
    '<b>Confidence</b>: %{customdata[6]:.3f}%',
    `<b>${statisticName}</b>: %{customdata[7]:.3f}`,
    '<b>Standard Error</b>: %{customdata[8]:.3f}',
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

    oddsRatios: oddsRatios,
    oddsRatioConfidenceIntervals,
  };
}

export type RegressionVisualizationData = ReturnType<
  typeof getRegressionCoefficientsVisualizationData
>;
