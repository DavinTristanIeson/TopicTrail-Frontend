import { client } from '@/common/api/client';
import {
  usePrepareStatisticalAnalysisDataProvider,
  useStatisticalAnalysisDataProviderParams,
} from './utils';
import {
  LinearRegressionResultModel,
  LogisticRegressionResultModel,
  MultinomialLogisticRegressionResultModel,
  OrdinalRegressionResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticalAnalysisDataProviderHook } from '../types';
import { LinearRegressionConfigType } from '../configuration/linear-regression';
import { LogisticRegressionConfigType } from '../configuration/logistic-regression';
import { NamedTableFilterModel } from '@/api/comparison';
import {
  MultinomialLogisticRegressionConfigType,
  OrdinalRegressionConfigType,
} from '../configuration/multinomial-regression';
import { TableFilterModel } from '@/api/table';

export const useLinearRegressionDataProvider: BaseStatisticalAnalysisDataProviderHook<
  LinearRegressionResultModel,
  LinearRegressionConfigType
> = function (options) {
  const { config } = options;
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: null,
      options: options,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/regression/linear',
    {
      body: {
        constrain_by_groups: config.constrain_by_groups,
        interpretation: config.interpretation,
        reference: config.reference ?? null,
        standardized: config.standardized,
        target: config.target,
        groups: subdatasets,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};

export const useLogisticRegressionDataProvider: BaseStatisticalAnalysisDataProviderHook<
  LogisticRegressionResultModel,
  LogisticRegressionConfigType
> = function (options) {
  const { config } = options;
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: null,
      options,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/regression/logistic',
    {
      body: {
        constrain_by_groups: config.constrain_by_groups,
        interpretation: config.interpretation,
        reference: config.reference ?? null,
        target: config.filter
          ? {
              name: config.target,
              filter: config.filter as TableFilterModel,
            }
          : config.target,
        groups: subdatasets,
        penalty: config.penalty || null,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};

export const useMultinomialLogisticRegressionDataProvider: BaseStatisticalAnalysisDataProviderHook<
  MultinomialLogisticRegressionResultModel,
  MultinomialLogisticRegressionConfigType
> = function (options) {
  const { config } = options;
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: null,
      options,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/regression/logistic/multinomial',
    {
      body: {
        constrain_by_groups: config.constrain_by_groups,
        interpretation: config.interpretation,
        reference: config.reference ?? null,
        target:
          config.subdatasets != null
            ? (config.subdatasets as NamedTableFilterModel[])
            : config.target,
        groups: subdatasets,
        reference_dependent: config.reference_dependent ?? null,
        penalty: config.penalty || null,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};

export const useOrdinalRegressionDataProvider: BaseStatisticalAnalysisDataProviderHook<
  OrdinalRegressionResultModel,
  OrdinalRegressionConfigType
> = function (options) {
  const { config } = options;
  const { subdatasets, params, queryConfig } =
    useStatisticalAnalysisDataProviderParams({
      groups: null,
      options,
    });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/regression/ordinal',
    {
      body: {
        constrain_by_groups: config.constrain_by_groups,
        interpretation: config.interpretation,
        reference: config.reference ?? null,
        target:
          config.subdatasets != null
            ? (config.subdatasets as NamedTableFilterModel[])
            : config.target,
        groups: subdatasets,
      },
      params,
    },
    queryConfig,
  );
  return usePrepareStatisticalAnalysisDataProvider({ query });
};
