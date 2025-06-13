import {
  LogisticRegressionCoefficientModel,
  MultinomialLogisticRegressionFacetResultModel,
} from '@/api/statistical-analysis';
import {
  type MRT_ColumnDef,
  useMantineReactTable,
  MantineReactTable,
} from 'mantine-react-table';
import React from 'react';
import {
  UltimateRegressionCoefficientModel,
  RegressionModelType,
  REGRESSION_MODEL_QUIRKS,
} from '../types';
import { formatNumber } from '@/common/utils/number';
import { pValueToConfidenceLevel, formatConfidenceInterval } from '../utils';
import {
  RowPinningColorProvider,
  SHARED_REGRESSION_COEFFICIENT_MRT_PROPS,
  SHARED_REGRESSION_MULTINOMIAL_COEFFICIENT_MRT_PROPS,
  TooltipHeader,
  useDependentVariableLevelGroupingColumns,
} from './common';

// region Columns

interface UseCoefficientsTableColumnsProps {
  modelType: RegressionModelType;
}

function useCoefficientsTableColumns(props: UseCoefficientsTableColumnsProps) {
  const { modelType } = props;
  return React.useMemo<
    MRT_ColumnDef<UltimateRegressionCoefficientModel>[]
  >(() => {
    const withOdds = !!REGRESSION_MODEL_QUIRKS[modelType].withOdds;
    const columns: MRT_ColumnDef<UltimateRegressionCoefficientModel>[] = [
      {
        id: 'name',
        header: 'Name',
        minSize: 250,
        Header: () => (
          <TooltipHeader tooltip="The name of the coefficients." title="Name" />
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
            tooltip="The actual value of the coefficient."
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
            tooltip="The standard error of the coefficient. A large standard error indicates that the effect of this coefficient is uncertain or that the data doesn't provide strong evidence for the effect of that variable."
            title="Std. Error"
          />
        ),
        Cell({ row: { original } }) {
          if (original.std_err == null) return null;
          return formatNumber(original.std_err);
        },
      },
      {
        id: 'statistic',
        header: 'Statistic',
        minSize: 150,
        size: 150,
        enableSorting: true,
        accessorFn: (coef) => coef.statistic,
        Header: () =>
          modelType === RegressionModelType.Linear ? (
            <TooltipHeader
              tooltip="The result of a t-test to check if the population coefficient is not zero. Consider interpreting this statistic as p values or confidence levels instead."
              title="t Statistic"
            />
          ) : (
            <TooltipHeader
              tooltip="The result of a Wald test to check if the population coefficient is not zero. Consider interpreting this statistic as p values or confidence levels instead."
              title="Z Statistic"
            />
          ),
        Cell({ row: { original } }) {
          if (original.statistic == null) return null;
          return formatNumber(original.statistic);
        },
      },
      {
        id: 'p_value',
        header: 'P Value',
        minSize: 150,
        size: 150,
        enableSorting: true,
        accessorFn: (coef) => coef.p_value,
        Header: () => (
          <TooltipHeader
            tooltip="The likelihood of observing the data with the assumption that the population coefficient of this independent variable is zero; as in, the independent variable doesn't have an effect on the dependent variable at all."
            title="P Value"
          />
        ),
        Cell({ row: { original } }) {
          if (original.p_value == null) return null;
          return formatNumber(original.p_value);
        },
      },
      {
        id: 'confidence_level',
        header: 'Confidence',
        minSize: 170,
        size: 170,
        enableSorting: true,
        accessorFn: (coef) => pValueToConfidenceLevel(coef.p_value),
        Header: () => (
          <TooltipHeader
            tooltip="The probability that the population coefficient is not zero; which means that the independent variable has a statistically significant effect on the dependent variable."
            title="Confidence"
          />
        ),
        Cell({ row: { original } }) {
          if (original.p_value == null) return null;
          return `${formatNumber(pValueToConfidenceLevel(original.p_value))}%`;
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
    ];
    if (withOdds) {
      columns.push(
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
          id: 'odds_ratio',
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
      );
    }
    return columns;
  }, [modelType]);
}

// region Table

interface RegressionCoefficientsTableRendererProps {
  modelType: RegressionModelType;
  coefficients: UltimateRegressionCoefficientModel[];
  intercept: UltimateRegressionCoefficientModel | null;
}

export function RegressionCoefficientsTableRenderer(
  props: RegressionCoefficientsTableRendererProps,
) {
  const { modelType, coefficients, intercept } = props;
  const columns = useCoefficientsTableColumns({
    modelType,
  });
  const rows = React.useMemo(
    () =>
      intercept
        ? [
            {
              ...intercept,
              name: 'Intercept',
            },
            ...coefficients,
          ]
        : coefficients,
    [coefficients, intercept],
  );
  const table = useMantineReactTable({
    data: rows,
    columns: columns,
    ...SHARED_REGRESSION_COEFFICIENT_MRT_PROPS,
  });
  return (
    <RowPinningColorProvider>
      <MantineReactTable table={table} />
    </RowPinningColorProvider>
  );
}

// region Multinomial

interface RegressionCoefficientsPerFacetTableRendererProps {
  facets: MultinomialLogisticRegressionFacetResultModel[];
}

export function RegressionCoefficientsPerFacetTableRenderer(
  props: RegressionCoefficientsPerFacetTableRendererProps,
) {
  const { facets } = props;
  const columns = useCoefficientsTableColumns({
    modelType: RegressionModelType.MultinomialLogistic,
  });
  const rows = React.useMemo<UltimateRegressionCoefficientModel[]>(() => {
    return facets
      .map((facet) => {
        return [facet.intercept, ...facet.coefficients].map((coef, index) => {
          return {
            ...coef,
            name: index === 0 ? 'Intercept' : coef.name,
            level: facet.level,
          };
        });
      })
      .flat();
  }, [facets]);
  const columnsWithLevel = useDependentVariableLevelGroupingColumns(columns);
  const table = useMantineReactTable({
    data: rows,
    columns: columnsWithLevel,
    ...SHARED_REGRESSION_MULTINOMIAL_COEFFICIENT_MRT_PROPS,
  });
  return (
    <RowPinningColorProvider>
      <MantineReactTable table={table} />
    </RowPinningColorProvider>
  );
}
