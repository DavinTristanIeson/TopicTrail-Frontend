import * as Yup from 'yup';

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
  // Regression
  LinearRegression = 'linear-regression',
  LogisticRegression = 'logistic-regression',
  MultinomialLogisticRegression = 'multinomial-logistic-regression',
  OrdinalRegression = 'ordinal-regression',
  // Statistic Test
  TwoSample = 'two-sample',
  Pairwise = 'pairwise',
  Omnibus = 'omnibus',
  SubdatasetCooccurrence = 'subdataset-cooccurrence',
  ContingencyTable = 'contingency-table',
  BinaryTestContingencyTable = 'binary-test-contingency-table',
  BinaryTestDistribution = 'binary-test-distribution',
}

export interface StatisticTestStateItem {
  type: StatisticTestPurpose;
  config: any;
}

export interface StatisticTestConfigurationEntry<TData, TConfig> {
  type: StatisticTestPurpose;
  label: string;
  description: string;
  dataProvider: BaseStatisticTestDataProviderHook<TData, TConfig>;
  configForm: React.FC<object>;
  configValidator: Yup.AnyObjectSchema;
  component: React.FC<BaseStatisticTestResultRendererProps<TData, TConfig>>;
  getParams(config: TConfig): Record<string, string>;
}
