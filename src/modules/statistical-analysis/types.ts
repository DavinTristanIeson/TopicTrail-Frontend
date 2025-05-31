import * as Yup from 'yup';

export type BaseStatisticalAnalysisDataProviderHook<TData, TConfig> = (
  config: TConfig,
) => {
  data: TData | undefined;
  loading: boolean;
  error: string | undefined;
  refetch(): void;
};

export interface BaseStatisticalAnalysisResultRendererProps<TData, TConfig> {
  data: TData;
  config: TConfig;
}

export enum StatisticalAnalysisPurpose {
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

export interface StatisticalAnalysisStateItem {
  type: StatisticalAnalysisPurpose;
  config: any;
}

export interface StatisticalAnalysisConfigurationEntry<TData, TConfig> {
  type: StatisticalAnalysisPurpose;
  label: string;
  description: string;
  dataProvider: BaseStatisticalAnalysisDataProviderHook<TData, TConfig>;
  configForm: React.FC<object>;
  configValidator: Yup.AnyObjectSchema;
  component: React.FC<
    BaseStatisticalAnalysisResultRendererProps<TData, TConfig>
  >;
  getParams(config: TConfig): Record<string, string>;
  actionLabel: string;
}
