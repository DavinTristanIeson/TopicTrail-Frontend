import {
  RegressionCoefficientModel,
  LogisticRegressionCoefficientModel,
  OrdinalRegressionCoefficientModel,
  RegressionPredictionInput,
  LinearRegressionResultModel,
  LogisticRegressionResultModel,
  MultinomialLogisticRegressionResultModel,
  OrdinalRegressionResultModel,
} from '@/api/statistical-analysis';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { type ComboboxItem, Select } from '@mantine/core';
import React from 'react';

export type UltimateRegressionResult =
  | LinearRegressionResultModel
  | LogisticRegressionResultModel
  | OrdinalRegressionResultModel
  | MultinomialLogisticRegressionResultModel;

export type UltimateRegressionCoefficientModel =
  | RegressionCoefficientModel
  | LogisticRegressionCoefficientModel
  | OrdinalRegressionCoefficientModel;

export enum RegressionCoefficientsVisualizationTypeEnum {
  Coefficient = 'coefficient',
  ConfidenceLevel = 'confidence',
  OddsRatio = 'odds-ratio',
}

export const REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY = {
  [RegressionCoefficientsVisualizationTypeEnum.Coefficient]: {
    label: 'Coefficient of Independent Variables',
    value: RegressionCoefficientsVisualizationTypeEnum.Coefficient,
    plotLabel: 'Coefficient',
    description:
      'Show the actual coefficients of each independent variable. Interpretation may vary depending on your selected interpretation method.',
  },
  [RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel]: {
    label: 'Confidence Level of Independent Variable Effects',
    plotLabel: 'Confidence Level',
    value: RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel,
    description:
      'Show the confidence level that an independent variable does have an effect on the dependent variable.',
  },
  [RegressionCoefficientsVisualizationTypeEnum.OddsRatio]: {
    label: 'Odds Ratio of Independent Variables',
    value: RegressionCoefficientsVisualizationTypeEnum.OddsRatio,
    plotLabel: 'Odds Ratio',
    description:
      'Show how each independent variable contributes to the odds of seeing an outcome in the independent variable. Interpretation may vary depending on your selected interpretation method and the type of the independent variable itself.',
  },
};

export enum RegressionVariableInfoVisualizationType {
  SampleSize = 'sample-size',
  VarianceInflationFactor = 'variance-inflation-factor',
  LevelSampleSize = 'level-sample-size',
  IndependentVariableCooccurrence = 'independent-variable-cooccurrence',
}

export const REGRESSION_VARIABLE_INFO_VISUALIZATION_TYPE_DICTIONARY = {
  [RegressionVariableInfoVisualizationType.SampleSize]: {
    label: 'Sample Size of Independent Variables',
    value: RegressionVariableInfoVisualizationType.SampleSize,
    description:
      'Show the number of samples that is included in each subdataset (where the independent variable has 1 as its value).',
  },
  [RegressionVariableInfoVisualizationType.VarianceInflationFactor]: {
    label: 'Variance Inflation Factor',
    value: RegressionVariableInfoVisualizationType.VarianceInflationFactor,
    description:
      'Show whether a particular independent variable is heavily correlated with the other independent variables or not. Values above 5 indicate a high-level of multicollinearity within the independent variables, which may cause the coefficients of the regression to be unstable and thus unreliable.',
  },
  [RegressionVariableInfoVisualizationType.IndependentVariableCooccurrence]: {
    label: 'Independent Variable Co-occurrence',
    plotLabel: 'VIF',
    value:
      RegressionVariableInfoVisualizationType.IndependentVariableCooccurrence,
    description:
      'Show how frequently the independent variables co-occur with each other. High co-occurrence rates may indicate that both variables are highly correlated, which may mess with the fit of the regression model.',
  },
  [RegressionVariableInfoVisualizationType.LevelSampleSize]: {
    label: 'Sample Size of Dependent Variable Levels',
    value: RegressionVariableInfoVisualizationType.LevelSampleSize,
    plotLabel: 'Sample Size',
    description:
      'Compare the number of samples that corresponds to each level of the dependent variable.',
  },
};

interface UseRegressionVisualizationTypeProps<T extends string> {
  supportedTypes: T[];
  dictionary: Record<T, ComboboxItem>;
}

export function useRegressionVisualizationTypeSelect<T extends string>(
  props: UseRegressionVisualizationTypeProps<T>,
) {
  const { supportedTypes, dictionary } = props;
  const [type, setType] = React.useState(supportedTypes[0]!);
  const isSupported = supportedTypes.includes(type);
  React.useEffect(() => {
    if (!isSupported) {
      setType(supportedTypes[0]!);
    }
  }, [isSupported, supportedTypes]);

  const options: ComboboxItem[] = (
    Object.values(dictionary) as ComboboxItem[]
  ).filter((option) => supportedTypes.includes(option.value as T));

  const renderOption = useDescriptionBasedRenderOption(dictionary);
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

export interface StatisticalAnalysisPredictionResultRendererProps<
  TResult,
  TConfig,
> {
  result: TResult;
  config: TConfig;
}

export enum RegressionModelType {
  Linear = 'linear',
  Logistic = 'logistic',
  MultinomialLogistic = 'multinomial-logistic',
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
  [RegressionModelType.MultinomialLogistic]: {
    statisticName: 'Z-Statistic',
    withOdds: true,
  },
  [RegressionModelType.Ordinal]: {
    statisticName: 'Z-Statistic',
    withOdds: true,
  },
};

interface RegressionPredictionAPIHookParams<TConfig> {
  config: TConfig;
  input: RegressionPredictionInput;
}

export type RegressionPredictionAPIHookType<TResult, TConfig> = (
  input: RegressionPredictionAPIHookParams<TConfig>,
) => {
  data: TResult | undefined;
  loading: boolean;
  execute(): Promise<void>;
};
