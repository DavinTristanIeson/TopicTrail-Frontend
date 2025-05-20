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
} from './configuration/binary';
import {
  ContingencyTableConfigForm,
  ContingencyTableConfig,
  contingencyTableFormSchema,
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

export const STATISTIC_TEST_CONFIGURATION: Record<
  StatisticTestPurpose,
  StatisticTestConfigurationEntry<any, any>
> = {
  [StatisticTestPurpose.BinaryTestContingencyTable]: {
    type: StatisticTestPurpose.BinaryTestContingencyTable,
    component: BinaryStatisticTestOnContingencyTableResultRenderer,
    configForm: ContingencyTableConfigForm,
    configValidator: contingencyTableFormSchema,
    dataProvider: useBinaryStatisticTestOnContingencyTableDataProvider,
    description: '',
    label: 'Binary Statistic Test on Contingency Table',
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
    description: '',
    label: 'Binary Statistic Test on Distribution',
  } as StatisticTestConfigurationEntry<
    BinaryStatisticTestOnDistributionResultModel,
    BinaryStatisticTestConfig
  >,
  [StatisticTestPurpose.ContingencyTable]: {
    type: StatisticTestPurpose.ContingencyTable,
    component: ContingencyTableResultRenderer,
    configForm: ContingencyTableConfigForm,
    configValidator: contingencyTableFormSchema,
    dataProvider: useContingencyTableStatisticTestDataProvider,
    description: '',
    label: 'Contingency Table',
  } as StatisticTestConfigurationEntry<
    ContingencyTableModel,
    ContingencyTableConfig
  >,
  [StatisticTestPurpose.Omnibus]: {
    type: StatisticTestPurpose.Omnibus,
    component: StatisticTestResultRenderer,
    configForm: OmnibusStatisticTestConfigForm,
    configValidator: omnibusStatisticTestFormSchema,
    dataProvider: useOmnibusStatisticTestDataProvider,
    description: '',
    label: 'Omnibus Statistic Test',
  } as StatisticTestConfigurationEntry<
    StatisticTestResultModel,
    OmnibusStatisticTestConfig
  >,
  [StatisticTestPurpose.TwoSample]: {
    type: StatisticTestPurpose.TwoSample,
    component: StatisticTestResultRenderer,
    configForm: TwoSampleStatisticTestConfigForm,
    configValidator: twoSampleStatisticTestFormSchema,
    dataProvider: useTwoSampleStatisticTestDataProvider,
    description: '',
    label: 'Two-Sample Statistic Test',
  } as StatisticTestConfigurationEntry<
    StatisticTestResultModel,
    TwoSampleStatisticTestConfig
  >,
  [StatisticTestPurpose.Pairwise]: {
    type: StatisticTestPurpose.Pairwise,
    component: PairwiseStatisticTestResultRenderer,
    configForm: TwoSampleStatisticTestConfigForm,
    configValidator: twoSampleStatisticTestFormSchema,
    dataProvider: usePairwiseTwoSampleStatisticTestDataProvider,
    description: '',
    label: 'Pairwise Two-Sample Statistic Test',
  } as StatisticTestConfigurationEntry<
    PairwiseStatisticTestResultModel,
    TwoSampleStatisticTestConfig
  >,
};
