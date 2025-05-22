import {
  BinaryStatisticTestOnContingencyTableMainResultModel,
  BinaryStatisticTestOnDistributionResultModel,
  ContingencyTableModel,
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

export const STATISTIC_TEST_CONFIGURATION: Record<
  StatisticTestPurpose,
  StatisticTestConfigurationEntry<any, any>
> = {
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
