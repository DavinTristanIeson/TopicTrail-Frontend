import { LogisticRegressionCoefficientModel } from '@/api/statistic-test';
import { maybeElement } from '@/common/utils/iterable';
import { zip } from 'lodash-es';
import {
  UltimateRegressionCoefficientModel,
  RegressionVisualizationTypeEnum,
} from './types';

interface useRegressionVisualizationDataProps {
  coefficients: UltimateRegressionCoefficientModel[];
  supportedTypes: RegressionVisualizationTypeEnum[];
  statisticName: string;
}

export function useRegressionVisualizationData(
  props: useRegressionVisualizationDataProps,
) {
  const { coefficients, supportedTypes, statisticName } = props;
  const withOdds = supportedTypes.includes(
    RegressionVisualizationTypeEnum.OddsRatio,
  );

  const independentVariables = coefficients.map(
    (coefficient) => coefficient.name,
  );
  const coefficientValues = coefficients.map(
    (coefficient) => coefficient.value,
  );
  const pValues = coefficients.map((coefficient) => coefficient.p_value);
  const confidenceLevels = coefficients.map(
    (coefficient) => (1 - coefficient.p_value) * 100,
  );
  const sampleSizes = coefficients.map(
    (coefficient) => coefficient.sample_size,
  );
  const confidenceIntervals = coefficients.map(
    (coefficient) => coefficient.confidence_interval,
  );
  const confidenceIntervalStrings = confidenceIntervals.map(
    (interval) => `${interval[0].toFixed(3)} - ${interval[1].toFixed(3)}`,
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
    standardErrors,
    pValues,
    confidenceLevels,
    statistics,
    confidenceIntervalStrings,
    sampleSizes,
    varianceInflationFactors,
  ] as any[];
  if (withOdds && oddsRatios) {
    rawCustomdata.push(oddsRatios);
  }

  const customdata = zip(...rawCustomdata);

  const hovertemplate = [
    'Variable: %{customdata[0]}',
    'Coefficient: %{customdata[1]:.3f}',
    ...maybeElement(withOdds, 'Odds: %{customdata[10]:.3f'),
    'Std. Error: %{customdata[2]:.3f}',
    'P-Value: %{customdata[3]:.3f} (Confidence: %{customdata[4]:.3f})',
    `${statisticName}: %{customdata[5]:.3f}`,
    'Confidence Interval: %{customdata[6]} (for Alpha=0.05)',
    'Sample Size: %{customdata[7]}',
    'Variance Inflation Factor: %{customdata[8]:.3f}',
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
  typeof useRegressionVisualizationData
>;
