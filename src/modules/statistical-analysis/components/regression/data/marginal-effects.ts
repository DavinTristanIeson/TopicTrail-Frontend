import { RegressionCoefficientModel } from '@/api/statistical-analysis';
import { zip } from 'lodash-es';
import {
  formatProbabilityConfidenceInterval,
  pValueToConfidenceLevel,
} from '../utils';

interface RegressionMarginalEffectsVisualizationDataProps {
  marginalEffects: RegressionCoefficientModel[];
}

export function getRegressionProbabilityMarginalEffectsVisualizationData(
  props: RegressionMarginalEffectsVisualizationDataProps,
) {
  const { marginalEffects } = props;
  const independentVariables = marginalEffects.map((effect) => effect.name);
  const probabilities = marginalEffects.map((effect) => effect.value * 100);
  const pValues = marginalEffects.map((coefficient) => coefficient.p_value);
  const confidenceLevels = pValues.map(pValueToConfidenceLevel);
  const confidenceIntervals = marginalEffects.map(
    (coefficient) =>
      [
        coefficient.confidence_interval[0] * 100,
        coefficient.confidence_interval[1] * 100,
      ] as [number, number],
  );
  const confidenceIntervalStrings = marginalEffects
    .map((coefficient) => coefficient.confidence_interval)
    .map(formatProbabilityConfidenceInterval);
  const statistics = marginalEffects.map(
    (coefficient) => coefficient.statistic,
  );
  const standardErrors = marginalEffects.map(
    (coefficient) => coefficient.std_err,
  );

  const rawCustomdata = [
    independentVariables,
    probabilities.map((value) => value ?? '-'),
    confidenceIntervalStrings,

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
    '<b>Marginal Effect</b>: %{customdata[1]:.3f}%',
    '<b>Confidence Interval</b>: %{customdata[2]} (for Alpha = 0.05)',
    '='.repeat(30),
    '<b>P-Value</b>: %{customdata[3]:.3f}',
    '<b>Confidence</b>: %{customdata[4]:.3f}%',
    `<b>Z-Statistic</b>: %{customdata[5]:.3f}`,
    '<b>Standard Error</b>: %{customdata[6]:.3f}',
  ].join('<br>');
  return {
    customdata,
    hovertemplate,

    xaxisTitle: 'Independent Variables (Subdatasets)',

    variables: independentVariables,
    values: probabilities,
    marginalEffects: marginalEffects,
    confidenceIntervals,

    standardErrors,
    pValues,
    confidenceLevels,
    statistics,
    confidenceIntervalStrings,
  };
}

export type RegressionMarginalEffectsVisualizationData = ReturnType<
  typeof getRegressionProbabilityMarginalEffectsVisualizationData
>;
