import {
  BinaryStatisticTestOnContingencyTableMainResultModel,
  BinaryStatisticTestOnDistributionResultModel,
  ContingencyTableModel,
  LinearRegressionResultModel,
  LogisticRegressionResultModel,
  MultinomialLogisticRegressionResultModel,
  OrdinalRegressionResultModel,
  PairwiseStatisticTestResultModel,
  StatisticTestResultModel,
} from '@/api/statistic-test';
import {
  BinaryStatisticTestConfigForm,
  binaryStatisticTestFormSchema,
  BinaryStatisticTestConfig,
  pairwiseStatisticTestFormSchema,
  PairwiseStatisticTestConfigForm,
} from './configuration/binary';
import {
  ContingencyTableConfigForm,
  ContingencyTableConfig,
  contingencyTableFormSchema,
  BinaryContingencyTableConfigForm,
  binaryContingencyTableFormSchema,
} from './configuration/contingency-table';
import {
  OmnibusStatisticTestConfig,
  OmnibusStatisticTestConfigForm,
  omnibusStatisticTestFormSchema,
} from './configuration/omnibus';
import {
  TwoSampleStatisticTestConfig,
  TwoSampleStatisticTestConfigForm,
  twoSampleStatisticTestFormSchema,
} from './configuration/two-sample';
import useContingencyTableStatisticTestDataProvider from './data-provider/contingency-table';
import { StatisticTestConfigurationEntry, StatisticTestPurpose } from './types';
import {
  useBinaryStatisticTestOnContingencyTableDataProvider,
  useBinaryStatisticTestOnDistributionDataProvider,
} from './data-provider/binary';
import useOmnibusStatisticTestDataProvider from './data-provider/omnibus';
import {
  usePairwiseTwoSampleStatisticTestDataProvider,
  useTwoSampleStatisticTestDataProvider,
} from './data-provider/two-sample';
import BinaryStatisticTestOnContingencyTableResultRenderer from './components/binary-test-contingency-table';
import BinaryStatisticTestOnDistributionResultRenderer from './components/binary-test-distribution';
import ContingencyTableResultRenderer from './components/contingency-table';
import StatisticTestResultRenderer from './components/results';
import { PairwiseStatisticTestResultRenderer } from './components/pairwise';
import {
  EFFECT_SIZE_DICTIONARY,
  OMNIBUS_STATISTIC_TEST_METHOD_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from './dictionary';
import {
  EffectSizeMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import SubdatasetCooccurrenceResultRenderer from './components/subdataset-cooccurrence';
import { useStatisticTestSubdatasetCooccurrenceDataProvider } from './data-provider/subdataset-cooccurrence';
import { SubdatasetCooccurrenceModel } from '@/api/comparison';
import * as Yup from 'yup';
import {
  LinearRegressionConfigForm,
  LinearRegressionConfigType,
  linearRegressionInputSchema,
  LogisticRegressionConfigForm,
  MultinomialLogisticRegressionConfigForm,
  MultinomialLogisticRegressionConfigType,
  multinomialLogisticRegressionInputSchema,
  OrdinalRegressionConfigForm,
} from './configuration/regression';
import {
  useLinearRegressionDataProvider,
  useLogisticRegressionDataProvider,
  useMultinomialLogisticRegressionDataProvider,
  useOrdinalRegressionDataProvider,
} from './data-provider/regression';
import {
  RegressionConfigType,
  regressionInputSchema,
} from './configuration/regression-common';

function getBasicStatisticTestParams(config: {
  column: string;
  statistic_test_preference: StatisticTestMethodEnum;
  effect_size_preference: EffectSizeMethodEnum;
}) {
  return {
    Column: config.column,
    'Statistic Test':
      STATISTIC_TEST_METHOD_DICTIONARY[config.statistic_test_preference]
        ?.label ?? config.statistic_test_preference,
    'Effect Size':
      EFFECT_SIZE_DICTIONARY[config.effect_size_preference]?.label ??
      config.effect_size_preference,
  };
}

function getExcludeOverlappingRowsParams(config: {
  exclude_overlapping_rows: boolean;
}) {
  return {
    'Exclude Overlapping Rows': config.exclude_overlapping_rows ? 'Yes' : 'No',
  };
}

function getRegressionParams(config: RegressionConfigType) {
  const base: Record<string, string> = {
    'Dependent Variable': config.target,
    Interpretation: config.interpretation,
  };
  if (config.constrain_by_groups) {
    base['Constrain by Groups'] = 'Yes';
  }
  if (config.reference) {
    base['Reference'] = config.reference;
  }
  return base;
}

export const STATISTIC_TEST_CONFIGURATION: Record<
  StatisticTestPurpose,
  StatisticTestConfigurationEntry<any, any>
> = {
  [StatisticTestPurpose.LinearRegression]: {
    type: StatisticTestPurpose.LinearRegression,
    component: null as any,
    configForm: LinearRegressionConfigForm,
    configValidator: linearRegressionInputSchema,
    dataProvider: useLinearRegressionDataProvider,
    description:
      'Use each subdataset as the independent variable of a linear regression to figure out how the criteria of each subdataset contributes to the mean of a continuous dependent variable.',
    label: 'Linear Regression',
    getParams(config) {
      const base = getRegressionParams(config);
      if (config.standardized) {
        base['Standardize Dependent Variable'] = 'Yes';
      }
      return base;
    },
  } as StatisticTestConfigurationEntry<
    LinearRegressionResultModel,
    LinearRegressionConfigType
  >,
  [StatisticTestPurpose.LogisticRegression]: {
    type: StatisticTestPurpose.LogisticRegression,
    component: null as any,
    configForm: LogisticRegressionConfigForm,
    configValidator: regressionInputSchema,
    dataProvider: useLogisticRegressionDataProvider,
    description:
      'Use each subdataset as the independent variable of a linear regression to figure out how the criteria of each subdataset contributes to the odds of predicting whether the dependent variable is true or false.',
    label: 'Logistic Regression',
    getParams: getRegressionParams,
  } as StatisticTestConfigurationEntry<
    LogisticRegressionResultModel,
    RegressionConfigType
  >,
  [StatisticTestPurpose.MultinomialLogisticRegression]: {
    type: StatisticTestPurpose.MultinomialLogisticRegression,
    component: null as any,
    configForm: MultinomialLogisticRegressionConfigForm,
    configValidator: multinomialLogisticRegressionInputSchema,
    dataProvider: useMultinomialLogisticRegressionDataProvider,
    description:
      'Use each subdataset as the independent variable of a linear regression to figure out how the criteria of each subdataset contributes to the odds of predicting the categories of the dependent variable.',
    label: 'Multinomial Logistic Regression',
    getParams(config) {
      const base = getRegressionParams(config);
      if (config.reference_dependent) {
        base['Dependent Variable Reference'] = config.reference_dependent;
      }
      return base;
    },
  } as StatisticTestConfigurationEntry<
    MultinomialLogisticRegressionResultModel,
    MultinomialLogisticRegressionConfigType
  >,
  [StatisticTestPurpose.OrdinalRegression]: {
    type: StatisticTestPurpose.OrdinalRegression,
    component: null as any,
    configForm: OrdinalRegressionConfigForm,
    configValidator: regressionInputSchema,
    dataProvider: useOrdinalRegressionDataProvider,
    description:
      'Use each subdataset as the independent variable of an ordinal regression to figure out how the criteria of each subdataset contributes to the odds of a value being higher-ranked or lower-ranked.',
    label: 'Ordinal Regression',
    getParams: getRegressionParams,
  } as StatisticTestConfigurationEntry<
    OrdinalRegressionResultModel,
    RegressionConfigType
  >,
  [StatisticTestPurpose.TwoSample]: {
    type: StatisticTestPurpose.TwoSample,
    component: StatisticTestResultRenderer,
    configForm: TwoSampleStatisticTestConfigForm,
    configValidator: twoSampleStatisticTestFormSchema,
    dataProvider: useTwoSampleStatisticTestDataProvider,
    description:
      'Test if there is a statistically significant difference between two subdatasets.',
    label: 'Two-Sample Statistic Test',
    getParams(config) {
      return {
        'Subdataset 1': config.group1,
        'Subdataset 2': config.group2,
        ...getBasicStatisticTestParams(config),
        ...getExcludeOverlappingRowsParams(config),
      };
    },
  } as StatisticTestConfigurationEntry<
    StatisticTestResultModel,
    TwoSampleStatisticTestConfig
  >,
  [StatisticTestPurpose.Omnibus]: {
    type: StatisticTestPurpose.Omnibus,
    component: StatisticTestResultRenderer,
    configForm: OmnibusStatisticTestConfigForm,
    configValidator: omnibusStatisticTestFormSchema,
    dataProvider: useOmnibusStatisticTestDataProvider,
    description:
      'Test if the subdatasets can explain the variance observed in the data.',
    label: 'Omnibus Statistic Test',
    getParams(config) {
      return {
        Column: config.column,
        'Statistic Test':
          OMNIBUS_STATISTIC_TEST_METHOD_DICTIONARY[
            config.statistic_test_preference
          ]?.label ?? config.statistic_test_preference,
        ...getExcludeOverlappingRowsParams(config),
      };
    },
  } as StatisticTestConfigurationEntry<
    StatisticTestResultModel,
    OmnibusStatisticTestConfig
  >,
  [StatisticTestPurpose.Pairwise]: {
    type: StatisticTestPurpose.Pairwise,
    component: PairwiseStatisticTestResultRenderer,
    configForm: PairwiseStatisticTestConfigForm,
    configValidator: pairwiseStatisticTestFormSchema,
    dataProvider: usePairwiseTwoSampleStatisticTestDataProvider,
    description:
      'Test all possible pairs of subdatasets to see which pairs have statistically significantly difference with each other.',
    label: 'Pairwise Two-Sample Statistic Test',
    getParams(config) {
      return {
        ...getBasicStatisticTestParams(config),
        ...getExcludeOverlappingRowsParams(config),
      };
    },
  } as StatisticTestConfigurationEntry<
    PairwiseStatisticTestResultModel,
    TwoSampleStatisticTestConfig
  >,
  [StatisticTestPurpose.SubdatasetCooccurrence]: {
    type: StatisticTestPurpose.SubdatasetCooccurrence,
    component: SubdatasetCooccurrenceResultRenderer,
    configForm: () => <></>,
    configValidator: Yup.object().default({}),
    dataProvider: useStatisticTestSubdatasetCooccurrenceDataProvider,
    description:
      'Examine the number of rows that overlap for each available subdatasets to see if the filter criteria for those subdatasets tend to co-occur with each other.',
    label: 'Subdataset Co-occurrence',
    getParams() {
      return {};
    },
  } as StatisticTestConfigurationEntry<SubdatasetCooccurrenceModel, object>,
  [StatisticTestPurpose.ContingencyTable]: {
    type: StatisticTestPurpose.ContingencyTable,
    component: ContingencyTableResultRenderer,
    configForm: ContingencyTableConfigForm,
    configValidator: contingencyTableFormSchema,
    dataProvider: useContingencyTableStatisticTestDataProvider,
    description:
      'Calculates a contingency table for each pair of subdataset and category; consisting of the observed frequencies, the expected frequencies, the residuals, and the standardized residuals.',
    label: 'Contingency Table',
    getParams(config) {
      return {
        Column: config.column,
        ...getExcludeOverlappingRowsParams(config),
      };
    },
  } as StatisticTestConfigurationEntry<
    ContingencyTableModel,
    ContingencyTableConfig
  >,
  [StatisticTestPurpose.BinaryTestContingencyTable]: {
    type: StatisticTestPurpose.BinaryTestContingencyTable,
    component: BinaryStatisticTestOnContingencyTableResultRenderer,
    configForm: BinaryContingencyTableConfigForm,
    configValidator: binaryContingencyTableFormSchema,
    dataProvider: useBinaryStatisticTestOnContingencyTableDataProvider,
    description:
      'Each pair of subdataset and category will be used to create a 2 x 2 contingency table. This contingency table will be analyzed to calculate the correlation between the subdataset and category.',
    label: 'Binary Statistic Test on Contingency Table',
    getParams(config) {
      return {
        Column: config.column,
      };
    },
  } as StatisticTestConfigurationEntry<
    BinaryStatisticTestOnContingencyTableMainResultModel,
    ContingencyTableConfig
  >,
  [StatisticTestPurpose.BinaryTestDistribution]: {
    type: StatisticTestPurpose.BinaryTestDistribution,
    component: BinaryStatisticTestOnDistributionResultRenderer,
    configForm: BinaryStatisticTestConfigForm,
    configValidator: binaryStatisticTestFormSchema,
    dataProvider: useBinaryStatisticTestOnDistributionDataProvider,
    description:
      'Each subdataset will be treated as a binary variable that splits the dataset into two groups. Both groups will be compared with each other using a statistic test.',
    label: 'Binary Statistic Test on Distribution',
    getParams: getBasicStatisticTestParams,
  } as StatisticTestConfigurationEntry<
    BinaryStatisticTestOnDistributionResultModel,
    BinaryStatisticTestConfig
  >,
};
