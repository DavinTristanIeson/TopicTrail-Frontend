import { client } from '@/common/api/client';
import {
  usePrepareStatisticTestDataProvider,
  useStatisticTestDataProviderParams,
} from './utils';
import {
  LinearRegressionResultModel,
  LogisticRegressionResultModel,
  MultinomialLogisticRegressionResultModel,
  OneVsRestLogisticRegressionResultModel,
  OrdinalRegressionResultModel,
} from '@/api/statistic-test';
import { BaseStatisticTestDataProviderHook } from '../types';
import {
  LinearRegressionConfigType,
  MultinomialLogisticRegressionConfigType,
} from '../configuration/regression';
import { RegressionConfigType } from '../configuration/regression-common';

export const useLinearRegressionDataProvider: BaseStatisticTestDataProviderHook<
  LinearRegressionResultModel,
  LinearRegressionConfigType
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistic-test/{project_id}/regression/linear',
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
  RegressionConfigType
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistic-test/{project_id}/regression/logistic',
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

export const useOneVsRestLogisticRegressionDataProvider: BaseStatisticTestDataProviderHook<
  OneVsRestLogisticRegressionResultModel,
  RegressionConfigType
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistic-test/{project_id}/regression/logistic/one-vs-rest',
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

export const useMultinomialLogisticRegressionDataProvider: BaseStatisticTestDataProviderHook<
  MultinomialLogisticRegressionResultModel,
  MultinomialLogisticRegressionConfigType
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistic-test/{project_id}/regression/logistic/multinomial',
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
    '/statistic-test/{project_id}/regression/ordinal',
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
