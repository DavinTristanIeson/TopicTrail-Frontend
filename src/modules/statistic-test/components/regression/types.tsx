import {
  RegressionCoefficientModel,
  LogisticRegressionCoefficientModel,
  OrdinalRegressionCoefficientModel,
} from '@/api/statistic-test';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { ComboboxItem, Select } from '@mantine/core';
import React from 'react';

export type UltimateRegressionCoefficientModel =
  | RegressionCoefficientModel
  | LogisticRegressionCoefficientModel
  | OrdinalRegressionCoefficientModel;

export enum RegressionVisualizationTypeEnum {
  Coefficient = 'coefficient',
  Confidence = 'p_value',
  StdErr = 'std_err',
  Statistic = 'statistic',
  VarianceInflationFactor = 'variance_inflation_factor',
  OddsRatio = 'odds-ratio',
  SampleSize = 'sample-size',
  EffectOnIntercept = 'effect-on-intercept',
}
export const REGRESSION_VISUALIZATION_TYPE_DICTIONARY = {
  [RegressionVisualizationTypeEnum.Coefficient]: {
    label: 'Coefficient',
    value: RegressionVisualizationTypeEnum.Coefficient,
    description:
      'Show the actual coefficients of each independent variable. Interpretation may vary depending on your selected interpretation method.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.value;
    },
  },
  [RegressionVisualizationTypeEnum.Confidence]: {
    label: 'Confidence Level',
    value: RegressionVisualizationTypeEnum.Confidence,
    description:
      'Show the confidence level that an independent variable does have an effect on the dependent variable.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.p_value;
    },
  },
  [RegressionVisualizationTypeEnum.Statistic]: {
    label: 'Statistic',
    value: RegressionVisualizationTypeEnum.Statistic,
    description:
      "Show the actual statistic obtained when comparing the coefficients of the fitted model to the null model (a model that assumes that the variables don't contribute anything to the dependent variable).",
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.sample_size;
    },
  },
  [RegressionVisualizationTypeEnum.StdErr]: {
    label: 'Standard Error',
    value: RegressionVisualizationTypeEnum.StdErr,
    description:
      'Show the standard error when comparing the actual observed data with the fitted coefficients. A smaller number indicates that the independent variable can be used to precisely predict the values of the dependent variable.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.std_err;
    },
  },
  [RegressionVisualizationTypeEnum.VarianceInflationFactor]: {
    label: 'Variance Inflation Factor',
    value: RegressionVisualizationTypeEnum.VarianceInflationFactor,
    description:
      'Show whether a particular independent variable is heavily correlated with the other independent variables or not. Values above 5 indicate a high-level of multicollinearity within the independent variables, which may cause the coefficients of the regression to be unstable and thus unreliable.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.variance_inflation_factor;
    },
  },
  [RegressionVisualizationTypeEnum.SampleSize]: {
    label: 'Sample Size',
    value: RegressionVisualizationTypeEnum.SampleSize,
    description:
      'Show the number of samples that is included in each subdataset (where the independent variable has 1 as its value).',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.variance_inflation_factor;
    },
  },
  [RegressionVisualizationTypeEnum.EffectOnIntercept]: {
    label: 'Effect on Intercept',
    value: RegressionVisualizationTypeEnum.EffectOnIntercept,
    description:
      'Show how each independent variable applies its effects on the intercept.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      throw new Error("Can't select fields for Effect on Intercept.");
    },
  },
  // Logistic
  [RegressionVisualizationTypeEnum.OddsRatio]: {
    label: 'Odds Ratio',
    value: RegressionVisualizationTypeEnum.OddsRatio,
    description:
      'Show how each independent variable contributes to the odds of seeing an outcome in the independent variable. Interpretation may vary depending on your selected interpretation method and the type of the independent variable itself.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      if (!('odds' in coefficient)) {
        throw new Error('Odds cannot be interpreted from this coefficient.');
      }
      return coefficient.odds;
    },
  },
};

interface UseRegressionVisualizationTypeProps {
  supportedTypes: RegressionVisualizationTypeEnum[];
}

export function useRegressionVisualizationTypeSelect(
  props: UseRegressionVisualizationTypeProps,
) {
  const { supportedTypes } = props;
  const [type, setType] = React.useState(
    RegressionVisualizationTypeEnum.Coefficient,
  );
  const options: ComboboxItem[] = Object.values(
    REGRESSION_VISUALIZATION_TYPE_DICTIONARY,
  ).filter((option) => supportedTypes.includes(option.value));

  const renderOption = useDescriptionBasedRenderOption(
    REGRESSION_VISUALIZATION_TYPE_DICTIONARY,
  );
  const Component = (
    <Select
      label="Visualization Type"
      required
      data={options}
      value={type}
      onChange={setType as React.Dispatch<React.SetStateAction<string | null>>}
      allowDeselect={false}
      renderOption={renderOption}
    />
  );

  return { type, Component };
}
