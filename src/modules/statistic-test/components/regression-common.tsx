import {
  LinearRegressionResultModel,
  LogisticRegressionCoefficientModel,
  OrdinalRegressionCoefficientModel,
  RegressionCoefficientModel,
} from '@/api/statistic-test';
import { LinearRegressionConfigType } from '../configuration/regression';
import { BaseStatisticTestResultRendererProps } from '../types';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { maybeElement } from '@/common/utils/iterable';
import { ComboboxItem, Select } from '@mantine/core';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { zip } from 'lodash-es';

type UltimateRegressionCoefficientModel =
  | RegressionCoefficientModel
  | LogisticRegressionCoefficientModel
  | OrdinalRegressionCoefficientModel;

interface UseRegressionHoverTemplateProps {
  coefficients: UltimateRegressionCoefficientModel[];
  statisticName: string;
}

export function getRegressionVisualizationData(
  props: UseRegressionHoverTemplateProps,
) {
  const { coefficients, statisticName } = props;

  const coefficientValues = coefficients.map(
    (coefficient) => coefficient.value,
  );
  const pValues = coefficients.map((coefficient) => coefficient.p_value);
  const sampleSizes = coefficients.map(
    (coefficient) => coefficient.sample_size,
  );
  const statistics = coefficients.map((coefficient) => coefficient.statistic);
  const confidenceIntervals = coefficients.map(
    (coefficient) => coefficient.confidence_interval,
  );
  const standardErrors = coefficients.map((coefficient) => coefficient.std_err);
  const varianceInflationFactors = coefficients.map(
    (coefficient) => coefficient.variance_inflation_factor,
  );
  const hasOdds = coefficients.length > 0 && 'odds' in coefficients[0]!;
  const odds = hasOdds
    ? coefficients.map(
        (coefficient) =>
          (coefficient as LogisticRegressionCoefficientModel).odds,
      )
    : undefined;

  const customdata = coefficients.map((coefficient) => {
    const base = [
      coefficient.name,
      coefficient.value,
      coefficient.std_err,
      coefficient.p_value,
      (1 - coefficient.p_value) * 100,
      coefficient.statistic,
      `${coefficient.confidence_interval[0].toFixed(3)} - ${coefficient.confidence_interval[1].toFixed(3)}`,
      coefficient.sample_size,
      coefficient.variance_inflation_factor,
    ];
    if ('odds' in coefficient) {
      base.push(coefficient.odds);
    }
  });
  const hovertemplate = [
    'Variable: %{customdata[0]}',
    'Coefficient: %{customdata[1]:.3f}',
    ...maybeElement(hasOdds, 'Odds: %{customdata[9]:.3f'),
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
    coefficients: coefficientValues,
    pValues,
    sampleSizes,
    statistics,
    confidenceIntervals,
    standardErrors,
    varianceInflationFactors,
    odds,
  };
}

export enum RegressionVisualizationTypeEnum {
  Coefficient = 'coefficient',
  PValue = 'p_value',
  StdErr = 'std_err',
  Statistic = 'statistic',
  VarianceInflationFactor = 'variance_inflation_factor',
  Odds = 'odds',
}
export const REGRESSION_VISUALIZATION_TYPE_DICTIONARY = {
  [RegressionVisualizationTypeEnum.Coefficient]: {
    label: 'Coefficient',
    value: RegressionVisualizationTypeEnum.Coefficient,
    description:
      'Show the actual coefficients of each independent variable. Interpretation may vary depending on your selected interpretation method.',
  },
  [RegressionVisualizationTypeEnum.Odds]: {
    label: 'Odds',
    value: RegressionVisualizationTypeEnum.Odds,
    description:
      'Show how each independent variable contributes to the odds of seeing an outcome in the independent variable. Interpretation may vary depending on your selected interpretation method and the type of the independent variable itself.',
  },
  [RegressionVisualizationTypeEnum.PValue]: {
    label: 'P-Value',
    value: RegressionVisualizationTypeEnum.PValue,
    description:
      'Show the p value of observing a particular coefficient under the assumption that its independent variable does not contribute any effects to the dependent variable.',
  },
  [RegressionVisualizationTypeEnum.Statistic]: {
    label: 'Statistic',
    value: RegressionVisualizationTypeEnum.PValue,
    description:
      "Show the actual statistic obtained when comparing the coefficients of the fitted model to the null model (a model that assumes that the variables don't contribute anything to the dependent variable).",
  },
  [RegressionVisualizationTypeEnum.StdErr]: {
    label: 'Standard Error',
    value: RegressionVisualizationTypeEnum.StdErr,
    description:
      'Show the standard error when comparing the actual observed data with the fitted coefficients. A smaller number indicates that the independent variable can be used to precisely predict the values of the dependent variable.',
  },
  [RegressionVisualizationTypeEnum.VarianceInflationFactor]: {
    label: 'Variance Inflation Factor',
    value: RegressionVisualizationTypeEnum.VarianceInflationFactor,
    description:
      'Show whether a particular independent variable is heavily correlated with the other independent variables or not. Values above 5 indicate a high-level of multicollinearity within the independent variables, which may cause the coefficients of the regression to be unstable and thus unreliable.',
  },
};

interface UseRegressionVisualizationTypeProps {
  withOdds: boolean;
}

export function useRegressionVisualizationType(
  props: UseRegressionVisualizationTypeProps,
) {
  const { withOdds } = props;
  const [type, setType] = React.useState(
    RegressionVisualizationTypeEnum.Coefficient,
  );
  let options: ComboboxItem[] = Object.values(
    REGRESSION_VISUALIZATION_TYPE_DICTIONARY,
  );
  if (withOdds === false) {
    options = options.filter(
      (option) => option.value === RegressionVisualizationTypeEnum.Odds,
    );
  }

  const renderOption = useDescriptionBasedRenderOption(
    REGRESSION_VISUALIZATION_TYPE_DICTIONARY,
  );
  const Component = (
    <Select
      label="Visualization Type"
      required
      value={type}
      onChange={setType as React.Dispatch<React.SetStateAction<string | null>>}
      allowDeselect={false}
      renderOption={renderOption}
    />
  );

  const selectData = React.useCallback(
    (data: ReturnType<typeof getRegressionVisualizationData>) => {
      switch (type) {
        case RegressionVisualizationTypeEnum.Coefficient: {
          return data.coefficients;
        }
        case RegressionVisualizationTypeEnum.Odds: {
          if (!withOdds) {
            throw new Error(`Odds is not supported for this regression type.`);
          }
          return data.odds;
        }
        case RegressionVisualizationTypeEnum.PValue: {
          return data.pValues;
        }
        case RegressionVisualizationTypeEnum.Statistic: {
          return data.statistics;
        }
        case RegressionVisualizationTypeEnum.StdErr: {
          return data.standardErrors;
        }
        case RegressionVisualizationTypeEnum.VarianceInflationFactor:
          {
            return data.varianceInflationFactors;
          }
          throw new Error(`Invalid regression visualization type: ${type}`);
      }
    },
    [],
  );

  return { type, Component, selectData };
}

interface useCommonRegressionResultPlot {
  coefficients: UltimateRegressionCoefficientModel[];
  statisticName: string;
  type: RegressionVisualizationTypeEnum;
}

export function useCommonRegressionResultPlot(
  props: useCommonRegressionResultPlot,
) {
  const { coefficients, statisticName, type } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const regressionData = getRegressionVisualizationData({
      coefficients: coefficients,
      statisticName: statisticName,
      type,
    });
    return {
      data: zip(),
      layout: {},
    };
  }, []);
}
