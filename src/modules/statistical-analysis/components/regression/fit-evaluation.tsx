import { LinearRegressionResultModel } from '@/api/statistical-analysis';
import { RegressionModelType, UltimateRegressionResult } from './types';
import React from 'react';
import { pValueToConfidenceLevel } from './utils';
import { formatNumber } from '@/common/utils/number';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';
import { Group, Stack, Text, Tooltip } from '@mantine/core';
import { StatisticTestWarningsRenderer } from '../statistic-test/common';
import { Info } from '@phosphor-icons/react';
import Colors from '@/common/constants/colors';

type LikelihoodBasedRegressionResultModel = Exclude<
  UltimateRegressionResult,
  LinearRegressionResultModel
>;

interface FitEvaluationTableProps {
  data: UltimateRegressionResult;
  modelType: RegressionModelType;
}

type ColumnAccessor<T> = {
  label: string;
  description?: string;
  accessor(data: T): any;
};

const COMMON_REGRESSION_ACCESSORS: ColumnAccessor<UltimateRegressionResult>[] =
  [
    {
      label: 'Number of Observations',
      description: 'The number of observations used to fit the model.',
      accessor(data) {
        return data.sample_size;
      },
    },
    {
      label: 'Model Degrees of Freedom',
      description: 'The number of predictors used to fit the model.',
      accessor(data) {
        return data.fit_evaluation.model_dof;
      },
    },
    {
      label: 'Residual Degrees of Freedom',
      description:
        'The number of data points that are used to estimate error variance after fitting parameters. It represents the number of values that are free to vary once constraints in the form of fitted coefficients are applied.',
      accessor(data) {
        return data.fit_evaluation.residual_dof;
      },
    },
  ];

const COMMON_REGRESSION_FIT_COMPARISON_ACCESSORS: ColumnAccessor<UltimateRegressionResult>[] =
  [
    {
      label: 'AIC',
      description:
        "Stands for Akaike Information Criterion. It's a measure for model selection that balances goodness of fit with model complexity, penalizing each additional parameter. AIC tends to favor complex models. Compare this with BIC to determine which independent variables best explains your dependent variable.",
      accessor(data: LinearRegressionResultModel) {
        return data.fit_evaluation.aic;
      },
    },
    {
      label: 'BIC',
      description:
        "Stands for Bayesian Information Criterion. It's a measure for model selection that balances goodness of fit with model complexity. BIC tends to prefer simpler models. Compare this with AIC to determine which independent variables best explains your dependent variable.",
      accessor(data: LinearRegressionResultModel) {
        return data.fit_evaluation.bic;
      },
    },
    {
      label: 'Log-Likelihood',
      description:
        'The logarithm of the likelihood function. It represents how well the model explains the observed data. Less negative (higher) values represent better fit. You can use this to compare the fit of NESTED models. You should not use log-likelihood to compare models that do not share one or more independent variables; use AIC and/or BIC instead.',
      accessor(data: LinearRegressionResultModel) {
        return data.fit_evaluation.log_likelihood;
      },
    },
  ];

const COMMON_LIKELIHOOD_BASED_COLUMN_ACCESSORS: ColumnAccessor<LikelihoodBasedRegressionResultModel>[] =
  [
    {
      label: 'Log-Likelihood Ratio',
      description:
        'A test statistic that compares the fit of the fitted model and the null model (model fitted without any independent variables). This is used to calculate the p value.',
      accessor(data: LikelihoodBasedRegressionResultModel) {
        return data.fit_evaluation.log_likelihood_ratio;
      },
    },
    {
      label: 'P Value (LLR Test)',
      description:
        'A p value calculated from the log-likelihood ratio test. A very small p value indicates that the fitted model explains the dependent variable significantly better than the null model.',
      accessor(data: LikelihoodBasedRegressionResultModel) {
        return data.fit_evaluation.p_value;
      },
    },
    {
      label: 'Confidence Level',
      accessor(data: LikelihoodBasedRegressionResultModel) {
        return `${formatNumber(pValueToConfidenceLevel(data.fit_evaluation.p_value))}%`;
      },
    },
    {
      label: "McFadden's R-Squared",
      description:
        "McFadden's R-Squared is a pseudo R-Squared metric for logistic regression that measures the proportional improvement (log-likelihood gain) of the model over the null model. Values around 0.2 to 0.4 generally indicates a decent fit.",
      accessor(data: LikelihoodBasedRegressionResultModel) {
        return data.fit_evaluation.pseudo_r_squared;
      },
    },
    ...COMMON_REGRESSION_FIT_COMPARISON_ACCESSORS,
  ];

const LINEAR_COLUMN_ACCESSORS: ColumnAccessor<LinearRegressionResultModel>[] = [
  ...COMMON_REGRESSION_ACCESSORS,
  {
    label: 'F Statistic',
    description:
      'A test statistic calculated from the F test that tests the null hypothesis that all regression coefficients (except the intercept) are zero; against the alternative that at least one predictor has a non-zero effect.',
    accessor(data: LinearRegressionResultModel) {
      return data.fit_evaluation.f_statistic;
    },
  },
  {
    label: 'P Value (F Test)',
    description:
      'A p value calculated from the F test. A very small p value indicates that the fitted model explains the dependent variable significantly better than the null model.',
    accessor(data: LinearRegressionResultModel) {
      return data.fit_evaluation.p_value;
    },
  },
  {
    label: 'Confidence Level',
    accessor(data: LikelihoodBasedRegressionResultModel) {
      return `${formatNumber(pValueToConfidenceLevel(data.fit_evaluation.p_value))}%`;
    },
  },
  {
    label: 'Adjusted R-Squared',
    description:
      'The proportion of variance explained by the regression model while penalizing for the number of predictors; this is a more accurate assessment of model fit than R-squared.',
    accessor(data: LinearRegressionResultModel) {
      return data.fit_evaluation.r_squared;
    },
  },
  {
    label: 'RMSE',
    description:
      'Stands for Root Mean Squared Error. It measures the average magnitude of prediction errors in a regression model.',
    accessor(data: LinearRegressionResultModel) {
      return data.fit_evaluation.rmse;
    },
  },
  ...COMMON_REGRESSION_FIT_COMPARISON_ACCESSORS,
];

const CONVERGED_COLUMN_ACCESSOR = {
  label: 'Converged',
  description:
    'Did the regression model converge successfully? It did not, then the coefficients of the model should not be relied on.',
  accessor(data: LikelihoodBasedRegressionResultModel) {
    return data.fit_evaluation.converged ? 'Yes' : 'No';
  },
};
const LOGISTIC_COLUMN_ACCESSORS = [
  ...COMMON_REGRESSION_ACCESSORS,
  CONVERGED_COLUMN_ACCESSOR,
  ...COMMON_LIKELIHOOD_BASED_COLUMN_ACCESSORS,
];
const MULTINOMIAL_LOGISTIC_COLUMN_ACCESSORS = [
  ...COMMON_REGRESSION_ACCESSORS,
  CONVERGED_COLUMN_ACCESSOR,
  ...COMMON_LIKELIHOOD_BASED_COLUMN_ACCESSORS,
];
const ORDINAL_LOGISTIC_COLUMN_ACCESSORS = [
  ...COMMON_REGRESSION_ACCESSORS,
  CONVERGED_COLUMN_ACCESSOR,
  ...COMMON_LIKELIHOOD_BASED_COLUMN_ACCESSORS,
];

const COLUMN_ACCESSORS_SELECTOR = {
  [RegressionModelType.Linear]: LINEAR_COLUMN_ACCESSORS,
  [RegressionModelType.Logistic]: LOGISTIC_COLUMN_ACCESSORS,
  [RegressionModelType.MultinomialLogistic]:
    MULTINOMIAL_LOGISTIC_COLUMN_ACCESSORS,
  [RegressionModelType.Ordinal]: ORDINAL_LOGISTIC_COLUMN_ACCESSORS,
};

export default function FitEvaluationTable(props: FitEvaluationTableProps) {
  const { data, modelType } = props;
  const accessors = COLUMN_ACCESSORS_SELECTOR[modelType];
  if (!accessors) {
    throw new Error(`${modelType} is not a valid regression model type.`);
  }
  const accessedValues = React.useMemo(() => {
    return accessors.map((accessor) => {
      return {
        label: accessor.label,
        description: accessor.description,
        value: accessor.accessor(data as any),
      };
    });
  }, [accessors, data]);
  const columns = React.useMemo<
    MRT_ColumnDef<(typeof accessedValues)[number]>[]
  >(() => {
    return [
      {
        header: 'Label',
        accessorKey: 'label',
        minSize: 200,
        Cell({ row: { original } }) {
          return (
            <Tooltip
              label={original.description}
              disabled={!original.description}
              maw={480}
            >
              <Group>
                <Text fw={500}>{original.label}</Text>
                {original.description && <Info color={Colors.brand} />}
              </Group>
            </Tooltip>
          );
        },
      },
      {
        header: 'Value',
        accessorKey: 'value',
        minSize: 400,
      },
    ];
  }, []);
  const table = useMantineReactTable({
    data: accessedValues,
    columns: columns,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    enableColumnOrdering: false,
    enableSorting: false,
    enableFilters: false,
    enablePagination: false,
    layoutMode: 'grid',
  });
  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={data.warnings} />
      <MantineReactTable table={table} />
    </Stack>
  );
}
