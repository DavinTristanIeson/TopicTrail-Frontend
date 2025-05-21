import * as Yup from 'yup';
import { BinaryStatisticTestConfig } from './configuration/binary';
import { OmnibusStatisticTestConfig } from './configuration/omnibus';
import { TwoSampleStatisticTestConfig } from './configuration/two-sample';
import { ContingencyTableConfig } from './configuration/contingency-table';

export type BaseStatisticTestDataProviderHook<TData, TConfig> = (
  config: TConfig,
) => {
  data: TData | undefined;
  loading: boolean;
  error: string | undefined;
  refetch(): void;
};

export interface BaseStatisticTestResultRendererProps<TData, TConfig> {
  data: TData;
  config: TConfig;
}

export enum StatisticTestPurpose {
  TwoSample = 'two-sample',
  Pairwise = 'pairwise',
  Omnibus = 'omnibus',
  ContingencyTable = 'contingency-table',
  BinaryTestContingencyTable = 'binary-test-contingency-table',
  BinaryTestDistribution = 'binary-test-distribution',
}

export interface StatisticTestConfigurationEntry<TData, TConfig> {
  type: StatisticTestPurpose;
  label: string;
  description: string;
  dataProvider: BaseStatisticTestDataProviderHook<TData, TConfig>;
  configForm: React.FC<object>;
  configValidator: Yup.AnyObjectSchema;
  component: React.FC<BaseStatisticTestResultRendererProps<TData, TConfig>>;
}

export type StatisticTestConfig =
  | BinaryStatisticTestConfig
  | OmnibusStatisticTestConfig
  | TwoSampleStatisticTestConfig
  | ContingencyTableConfig;
export interface StatisticTestHistoryEntry {
  type: StatisticTestPurpose;
  config: StatisticTestConfig;
}
