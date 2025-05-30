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
  pairwiseStatisticTestFormSchema,
  PairwiseStatisticTestConfigForm,
  OmnibusStatisticTestConfig,
  OmnibusStatisticTestConfigForm,
  omnibusStatisticTestFormSchema,
  TwoSampleStatisticTestConfig,
  TwoSampleStatisticTestConfigForm,
  twoSampleStatisticTestFormSchema,
} from './configuration/statistic-test';
import {
  ContingencyTableConfigForm,
  ContingencyTableConfig,
  contingencyTableFormSchema,
} from './configuration/contingency-table';
import { StatisticTestConfigurationEntry, StatisticTestPurpose } from './types';
import {
  useBinaryStatisticTestOnContingencyTableDataProvider,
  useBinaryStatisticTestOnDistributionDataProvider,
} from './data-provider/binary';
import BinaryStatisticTestOnContingencyTableResultRenderer from './components/statistic-test/binary-test-contingency-table';
import BinaryStatisticTestOnDistributionResultRenderer from './components/statistic-test/binary-test-distribution';
import ContingencyTableResultRenderer from './components/others/contingency-table';
import StatisticTestResultRenderer from './components/statistic-test/results';
import {
  EFFECT_SIZE_DICTIONARY,
  OMNIBUS_STATISTIC_TEST_METHOD_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from './dictionary';
import {
  EffectSizeMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import SubdatasetCooccurrenceResultRenderer from './components/others/subdataset-cooccurrence';
import { SubdatasetCooccurrenceModel } from '@/api/comparison';
import * as Yup from 'yup';
import {
  LinearRegressionConfigForm,
  LinearRegressionConfigType,
  linearRegressionInputSchema,
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
  REGRESSION_INTERPRETATION_DICTIONARY,
  RegressionConfigType,
  regressionInputSchema,
} from './configuration/regression-common';
import {
  LogisticRegressionConfigForm,
  LogisticRegressionConfigType,
  logisticRegressionInputSchema,
} from './configuration/logistic-regression';
import LogisticRegressionResultRenderer from './components/regression/logistic';
import MultinomialLogisticRegressionResultRenderer from './components/regression/multinomial-logistic';
import OrdinalRegressionResultRenderer from './components/regression/ordinal';
import LinearRegressionResultRenderer from './components/regression/linear';
import {
  BinaryContingencyTableConfigForm,
  binaryContingencyTableFormSchema,
  BinaryStatisticTestConfigForm,
  binaryStatisticTestFormSchema,
  BinaryStatisticTestConfig,
} from './configuration/binary-statistic-test';
import { PairwiseStatisticTestResultRenderer } from './components/statistic-test/pairwise';
import {
  useStatisticTestSubdatasetCooccurrenceDataProvider,
  useContingencyTableStatisticTestDataProvider,
} from './data-provider/contingency-table';
import {
  useTwoSampleStatisticTestDataProvider,
  useOmnibusStatisticTestDataProvider,
  usePairwiseTwoSampleStatisticTestDataProvider,
} from './data-provider/statistic-test';

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
    Interpretation:
      REGRESSION_INTERPRETATION_DICTIONARY[config.interpretation]?.label ??
      config.interpretation,
  };
  if (config.constrain_by_groups) {
    base['Constrain by Groups'] = 'Yes';
  }
  if (config.reference) {
    base['Reference'] = config.reference;
  }
  return base;
}

const REGRESSION_ACTION_LABEL = 'Fit Regression Model';
const STATISTIC_TEST_ACTION_LABEL = 'Perform Statistic Test';

export const STATISTIC_TEST_CONFIGURATION: Record<
  StatisticTestPurpose,
  StatisticTestConfigurationEntry<any, any>
> = {
  [StatisticTestPurpose.LinearRegression]: {
    type: StatisticTestPurpose.LinearRegression,
    component: LinearRegressionResultRenderer,
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
    actionLabel: REGRESSION_ACTION_LABEL,
  } as StatisticTestConfigurationEntry<
    LinearRegressionResultModel,
    LinearRegressionConfigType
  >,
  [StatisticTestPurpose.LogisticRegression]: {
    type: StatisticTestPurpose.LogisticRegression,
    component: LogisticRegressionResultRenderer,
    configForm: LogisticRegressionConfigForm,
    configValidator: logisticRegressionInputSchema,
    dataProvider: useLogisticRegressionDataProvider,
    description:
      'Use each subdataset as the independent variable of a linear regression to figure out how the criteria of each subdataset contributes to the odds of predicting whether the dependent variable is true or false.',
    label: 'Logistic Regression',
    getParams(config) {
      return getRegressionParams({
        ...config,
        target: config.target.name,
      });
    },
    actionLabel: REGRESSION_ACTION_LABEL,
  } as StatisticTestConfigurationEntry<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType
  >,
  [StatisticTestPurpose.MultinomialLogisticRegression]: {
    type: StatisticTestPurpose.MultinomialLogisticRegression,
    component: MultinomialLogisticRegressionResultRenderer,
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
    actionLabel: REGRESSION_ACTION_LABEL,
  } as StatisticTestConfigurationEntry<
    MultinomialLogisticRegressionResultModel,
    MultinomialLogisticRegressionConfigType
  >,
  [StatisticTestPurpose.OrdinalRegression]: {
    type: StatisticTestPurpose.OrdinalRegression,
    component: OrdinalRegressionResultRenderer,
    configForm: OrdinalRegressionConfigForm,
    configValidator: regressionInputSchema,
    dataProvider: useOrdinalRegressionDataProvider,
    description:
      'Use each subdataset as the independent variable of an ordinal regression to figure out how the criteria of each subdataset contributes to the odds of a value being higher-ranked or lower-ranked.',
    label: 'Ordinal Regression',
    getParams: getRegressionParams,
    actionLabel: REGRESSION_ACTION_LABEL,
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
    actionLabel: STATISTIC_TEST_ACTION_LABEL,
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
    actionLabel: STATISTIC_TEST_ACTION_LABEL,
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
    actionLabel: STATISTIC_TEST_ACTION_LABEL,
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
    actionLabel: 'Calculate Co-occurrence',
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
    actionLabel: 'Calculate Contingency Table',
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
    actionLabel: STATISTIC_TEST_ACTION_LABEL,
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
    actionLabel: STATISTIC_TEST_ACTION_LABEL,
  } as StatisticTestConfigurationEntry<
    BinaryStatisticTestOnDistributionResultModel,
    BinaryStatisticTestConfig
  >,
};
