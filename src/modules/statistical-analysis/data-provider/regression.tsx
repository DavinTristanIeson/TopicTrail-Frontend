import { client } from '@/common/api/client';
import {
  usePrepareStatisticTestDataProvider,
  useStatisticTestDataProviderParams,
} from './utils';
import {
  LinearRegressionResultModel,
  LogisticRegressionResultModel,
  MultinomialLogisticRegressionResultModel,
  OrdinalRegressionResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticTestDataProviderHook } from '../types';
import {
  LinearRegressionConfigType,
  MultinomialLogisticRegressionConfigType,
} from '../configuration/regression';
import { RegressionConfigType } from '../configuration/regression-common';
import { LogisticRegressionConfigType } from '../configuration/logistic-regression';
import { NamedTableFilterModel } from '@/api/comparison';

export const useLinearRegressionDataProvider: BaseStatisticTestDataProviderHook<
  LinearRegressionResultModel,
  LinearRegressionConfigType
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
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
  );
  return usePrepareStatisticTestDataProvider({ query });
};

export const useLogisticRegressionDataProvider: BaseStatisticTestDataProviderHook<
  LogisticRegressionResultModel,
  LogisticRegressionConfigType
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/regression/logistic',
    {
      body: {
        constrain_by_groups: config.constrain_by_groups,
        interpretation: config.interpretation,
        reference: config.reference ?? null,
        target: config.target as NamedTableFilterModel,
        groups: subdatasets,
      },
      params,
    },
  );
  return usePrepareStatisticTestDataProvider({ query });
};

export const useMultinomialLogisticRegressionDataProvider: BaseStatisticTestDataProviderHook<
  MultinomialLogisticRegressionResultModel,
  MultinomialLogisticRegressionConfigType
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/regression/logistic/multinomial',
    {
      body: {
        constrain_by_groups: config.constrain_by_groups,
        interpretation: config.interpretation,
        reference: config.reference ?? null,
        target: config.target,
        groups: subdatasets,
        reference_dependent: config.reference_dependent ?? null,
      },
      params,
    },
  );
  return usePrepareStatisticTestDataProvider({ query });
};

export const useOrdinalRegressionDataProvider: BaseStatisticTestDataProviderHook<
  OrdinalRegressionResultModel,
  RegressionConfigType
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/regression/ordinal',
    {
      body: {
        constrain_by_groups: config.constrain_by_groups,
        interpretation: config.interpretation,
        reference: config.reference ?? null,
        target: config.target,
        groups: subdatasets,
      },
      params,
    },
  );
  return usePrepareStatisticTestDataProvider({ query });
};
