import { LogisticRegressionCoefficientModel } from '@/api/statistical-analysis';
import { maybeElement } from '@/common/utils/iterable';
import {
  UltimateRegressionCoefficientModel,
  RegressionModelType,
  REGRESSION_MODEL_QUIRKS,
} from '../types';
import { formatConfidenceInterval, pValueToConfidenceLevel } from '../utils';

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
  const interceptOddsRatioConfidenceInterval = (
    intercept as LogisticRegressionCoefficientModel
  ).odds_ratio_confidence_interval;
  const customdata = [
    [
      intercept.value ?? '-',
      formatConfidenceInterval(intercept.confidence_interval),
      interceptOddsRatio ?? '-',
      formatConfidenceInterval(interceptOddsRatioConfidenceInterval),

      intercept.p_value ? pValueToConfidenceLevel(intercept.p_value) : '-',
      intercept.p_value ?? '-',
      intercept.statistic ?? '-',
      intercept.std_err ?? '-',
    ],
  ];
  const regressionQuirk = REGRESSION_MODEL_QUIRKS[modelType];
  const hovertemplate = [
    '<b>Intercept</b>: %{customdata[0]}',
    '<b>Confidence Interval</b>: %{customdata[1]} (for Alpha = 0.05)',
    ...maybeElement(regressionQuirk.withOdds, [
      '='.repeat(30),
      '<b>Odds Ratio</b>: %{customdata[2]}',
      '<b>Confidence Interval</b>: %{customdata[3]}',
    ]),
    '='.repeat(30),
    '<b>Confidence Level</b>: %{customdata[4]:.3f}%',
    '<b>P-Value</b>: %{customdata[5]}',
    `<b>${regressionQuirk.statisticName}</b>: %{customdata[6]}`,
    '<b>Std. Err</b>: %{customdata[7]}',
  ].join('<br>');
  return { customdata, hovertemplate };
}
