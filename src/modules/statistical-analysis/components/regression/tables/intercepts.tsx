import { LogisticRegressionCoefficientModel } from '@/api/statistical-analysis';
import { formatNumber } from '@/common/utils/number';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';
import {
  type MRT_ColumnDef,
  useMantineReactTable,
  MantineReactTable,
} from 'mantine-react-table';
import React from 'react';
import {
  SHARED_REGRESSION_COEFFICIENT_MRT_PROPS,
  TooltipHeader,
} from './common';
import { ActionIcon, Tooltip } from '@mantine/core';
import { TestTube } from '@phosphor-icons/react';
import { MultinomialLogisticRegressionConfigType } from '@/modules/statistical-analysis/configuration/multinomial-regression';
import { useComparisonAppState } from '@/modules/comparison/app-state';
import { StatisticalAnalysisPurpose } from '@/modules/statistical-analysis/types';
import { LogisticRegressionConfigType } from '@/modules/statistical-analysis/configuration/logistic-regression';
import { formatConfidenceInterval } from '../utils';
import { TableFilterTypeEnum } from '@/common/constants/enum';

interface RegressionCategoryLogisticRegressionButtonProps {
  config: MultinomialLogisticRegressionConfigType;
  original: LogisticRegressionCoefficientModel;
}

function RegressionCategoryLogisticRegressionButton(
  props: RegressionCategoryLogisticRegressionButtonProps,
) {
  const { config, original } = props;
  const setInput = useComparisonAppState(
    (store) => store.statisticalAnalysis.setInput,
  );
  return (
    <Tooltip label="Perform logistic regression with this threshold.">
      <ActionIcon
        variant="subtle"
        onClick={() => {
          if (config.subdatasets) {
            const subdataset = config.subdatasets.find(
              (subdataset) => subdataset.name === original.name,
            );
            if (!subdataset) return;
            setInput({
              type: StatisticalAnalysisPurpose.LogisticRegression,
              config: {
                target: subdataset?.name,
                constrain_by_groups: false,
                filter: subdataset.filter,
                interpretation: config.interpretation,
              } as LogisticRegressionConfigType,
            });
          } else {
            setInput({
              type: StatisticalAnalysisPurpose.LogisticRegression,
              config: {
                target: original.name,
                constrain_by_groups: false,
                filter: {
                  type: TableFilterTypeEnum.EqualTo,
                  target: config.target,
                  value: original.name,
                },
                interpretation: config.interpretation,
              } as LogisticRegressionConfigType,
            });
          }
        }}
      >
        <TestTube />
      </ActionIcon>
    </Tooltip>
  );
}

export function useMultinomialInterceptsTableColumns(
  config: MultinomialLogisticRegressionConfigType,
) {
  return React.useMemo<
    MRT_ColumnDef<LogisticRegressionCoefficientModel>[]
  >(() => {
    const columns: MRT_ColumnDef<LogisticRegressionCoefficientModel>[] = [
      {
        id: 'name',
        header: 'Name',
        minSize: 250,
        Header: () => (
          <TooltipHeader
            tooltip="The level of the dependent variable associated with this intercept."
            title="Name"
          />
        ),
        Cell({ row: { original } }) {
          return original.name;
        },
      },
      {
        id: 'coefficient',
        header: 'Coefficient',
        minSize: 150,
        size: 150,
        accessorFn: (coef) => coef.value,
        enableSorting: true,
        Header: () => (
          <TooltipHeader
            tooltip="The actual value of the intercept, expressed in log-odds of predicting this dependent variable level relative to the reference."
            title="Coefficient"
          />
        ),
        Cell({ row: { original } }) {
          if (original.value == null) return null;
          return formatNumber(original.value);
        },
      },
      {
        id: 'stderr',
        header: 'Std. Error',
        minSize: 150,
        size: 150,
        enableSorting: true,
        accessorFn: (coef) => coef.std_err,
        Header: () => (
          <TooltipHeader
            tooltip="The standard error of the intercept. A large standard error indicates that the baseline effect of this dependent variable level compared to the reference is uncertain or that the data doesn't provide strong evidence for the effect."
            title="Std. Error"
          />
        ),
        Cell({ row: { original } }) {
          if (original.std_err == null) return null;
          return formatNumber(original.std_err);
        },
      },
      {
        id: 'confidence_interval',
        header: 'Confidence Interval',
        minSize: 210,
        size: 210,
        Header: () => (
          <TooltipHeader
            tooltip="The interval that has a 95% chance to contain the population coefficient. A wide confidence interval indicates that the effect of the coefficient is uncertain. A confidence interval that crosses the zero-line (goes from negative to positive) indicates that the effect of the coefficient is ambiguous - it's not clear if it has a positive or negative effect on the dependent variable."
            title="Confidence Interval"
          />
        ),
        Cell({ row: { original } }) {
          if (original.confidence_interval == null) return null;
          return formatConfidenceInterval(original.confidence_interval);
        },
      },
      {
        id: 'odds_ratio',
        header: 'Odds Ratio',
        minSize: 150,
        size: 150,
        enableSorting: true,
        accessorFn: (coef) =>
          (coef as LogisticRegressionCoefficientModel).odds_ratio,
        Header: () => (
          <TooltipHeader
            tooltip="The transformation of the coefficients into odds ratios. Interpretation of the odds ratios depends on the model type."
            title="Odds Ratio"
          />
        ),
        Cell({ row: { original } }) {
          const coefficient = original as LogisticRegressionCoefficientModel;
          if (coefficient.odds_ratio == null) return null;
          return formatNumber(coefficient.odds_ratio);
        },
      },
      {
        id: 'odds_ratio_confidence_interval',
        header: 'Odds Ratio Confidence Interval',
        minSize: 270,
        size: 270,
        Header: () => (
          <TooltipHeader
            tooltip="The interval that has a 95% chance to contain the actual odds ratio."
            title="Odds Ratio Confidence Interval"
          />
        ),
        Cell({ row: { original } }) {
          const coefficient = original as LogisticRegressionCoefficientModel;
          if (coefficient.odds_ratio_confidence_interval == null) return null;
          return formatConfidenceInterval(
            coefficient.odds_ratio_confidence_interval,
          );
        },
      },
      {
        id: 'logistic',
        header: 'Logistic Regression',
        minSize: 50,
        size: 50,
        enableColumnActions: false,
        Header: () => null,
        Cell({ row: { original } }) {
          return (
            <RegressionCategoryLogisticRegressionButton
              config={config}
              original={original}
            />
          );
        },
      },
    ];
    return columns;
  }, [config]);
}

interface RegressionInterceptsTableProps {
  intercepts: LogisticRegressionCoefficientModel[];
  config: MultinomialLogisticRegressionConfigType;
}

export function RegressionInterceptsTable(
  props: RegressionInterceptsTableProps,
) {
  const { intercepts, config } = props;
  const columns = useMultinomialInterceptsTableColumns(config);
  const table = useMantineReactTable({
    data: intercepts,
    columns: columns,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    ...SHARED_REGRESSION_COEFFICIENT_MRT_PROPS,
  });
  return <MantineReactTable table={table} />;
}
