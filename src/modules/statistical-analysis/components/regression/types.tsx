import {
  RegressionCoefficientModel,
  LogisticRegressionCoefficientModel,
  OrdinalRegressionCoefficientModel,
} from '@/api/statistic-test';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { type ComboboxItem, Select } from '@mantine/core';
import React from 'react';
import { pValueToConfidenceLevel } from './utils';

export type UltimateRegressionCoefficientModel =
  | RegressionCoefficientModel
  | LogisticRegressionCoefficientModel
  | OrdinalRegressionCoefficientModel;

export enum RegressionVisualizationTypeEnum {
  Coefficient = 'coefficient',
  ConfidenceLevel = 'confidence',
  VarianceInflationFactor = 'variance_inflation_factor',
  OddsRatio = 'odds-ratio',
  SampleSize = 'sample-size',
  EffectOnIntercept = 'effect-on-intercept',

  // Multinomial logistic regression and ordinal regression
  LevelSampleSize = 'level-sample-sizes',
}

function getCoefficientOddsRatio(coefficient: RegressionCoefficientModel) {
  if (!('odds_ratio' in coefficient)) {
    throw new Error('Odds cannot be interpreted from this coefficient.');
  }
  // for base = 1
  return (coefficient.odds_ratio as number) - 1;
}
export const REGRESSION_VISUALIZATION_TYPE_DICTIONARY = {
  [RegressionVisualizationTypeEnum.Coefficient]: {
    label: 'Coefficient of Independent Variables',
    value: RegressionVisualizationTypeEnum.Coefficient,
    plotLabel: 'Coefficient',
    description:
      'Show the actual coefficients of each independent variable. Interpretation may vary depending on your selected interpretation method.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.value;
    },
  },
  [RegressionVisualizationTypeEnum.ConfidenceLevel]: {
    label: 'Confidence Level of Independent Variable Effects',
    plotLabel: 'Confidence Level',
    value: RegressionVisualizationTypeEnum.ConfidenceLevel,
    description:
      'Show the confidence level that an independent variable does have an effect on the dependent variable.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return pValueToConfidenceLevel(coefficient.p_value);
    },
  },
  [RegressionVisualizationTypeEnum.VarianceInflationFactor]: {
    label: 'Variance Inflation Factor',
    plotLabel: 'VIF',
    value: RegressionVisualizationTypeEnum.VarianceInflationFactor,
    description:
      'Show whether a particular independent variable is heavily correlated with the other independent variables or not. Values above 5 indicate a high-level of multicollinearity within the independent variables, which may cause the coefficients of the regression to be unstable and thus unreliable.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.variance_inflation_factor;
    },
  },
  [RegressionVisualizationTypeEnum.SampleSize]: {
    label: 'Sample Size of Independent Variables',
    value: RegressionVisualizationTypeEnum.SampleSize,
    plotLabel: 'Sample Size',
    description:
      'Show the number of samples that is included in each subdataset (where the independent variable has 1 as its value).',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.variance_inflation_factor;
    },
  },
  [RegressionVisualizationTypeEnum.EffectOnIntercept]: {
    label: 'Effect of Independent Variables on Intercept',
    value: RegressionVisualizationTypeEnum.EffectOnIntercept,
    plotLabel: 'Intercept + Effect',
    description:
      'Show how each independent variable applies its effects on the intercept.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      if ('odds_ratio' in coefficient) {
        return coefficient.odds_ratio;
      }
      return coefficient.value;
    },
  },
  // Logistic
  [RegressionVisualizationTypeEnum.OddsRatio]: {
    label: 'Odds Ratio of Independent Variables',
    value: RegressionVisualizationTypeEnum.OddsRatio,
    plotLabel: 'Odds Ratio',
    description:
      'Show how each independent variable contributes to the odds of seeing an outcome in the independent variable. Interpretation may vary depending on your selected interpretation method and the type of the independent variable itself.',
    select: getCoefficientOddsRatio,
  },
  [RegressionVisualizationTypeEnum.LevelSampleSize]: {
    label: 'Sample Size of Dependent Variable Levels',
    value: RegressionVisualizationTypeEnum.LevelSampleSize,
    plotLabel: 'Sample Size',
    description:
      'Compare the number of samples that corresponds to each level of the dependent variable.',
    select(coefficient: UltimateRegressionCoefficientModel) {
      return coefficient.sample_size;
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
  const [type, setType] = React.useState(supportedTypes[0]!);
  const isSupported = supportedTypes.includes(type);
  React.useEffect(() => {
    if (!isSupported) {
      setType(supportedTypes[0]!);
    }
  }, [isSupported, supportedTypes]);

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

export enum RegressionModelType {
  Linear = 'linear',
  Logistic = 'logistic',
  Ordinal = 'ordinal',
}

export const REGRESSION_MODEL_QUIRKS = {
  [RegressionModelType.Linear]: {
    statisticName: 'T-Statistic',
    withOdds: false,
  },
  [RegressionModelType.Logistic]: {
    statisticName: 'Z-Statistic',
    withOdds: true,
  },
  [RegressionModelType.Ordinal]: {
    statisticName: 'Z-Statistic',
    withOdds: true,
  },
};
