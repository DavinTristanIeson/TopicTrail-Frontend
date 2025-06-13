import { formatNumber } from '@/common/utils/number';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { UltimateRegressionCoefficientModel } from '../types';
import {
  pValueToConfidenceLevel,
  formatProbabilityConfidenceInterval,
} from '../utils';
import {
  RowPinningColorProvider,
  SHARED_REGRESSION_COEFFICIENT_MRT_PROPS,
  SHARED_REGRESSION_MULTINOMIAL_COEFFICIENT_MRT_PROPS,
  TooltipHeader,
  useDependentVariableLevelGroupingColumns,
} from './common';
import React from 'react';
import {
  MultinomialLogisticRegressionMarginalEffectsFacetResultModel,
  RegressionCoefficientModel,
} from '@/api/statistical-analysis';

// region Columns

function useMarginalEffectsTableColumns() {
  return React.useMemo<
    MRT_ColumnDef<UltimateRegressionCoefficientModel>[]
  >(() => {
    const columns: MRT_ColumnDef<UltimateRegressionCoefficientModel>[] = [
      {
        id: 'name',
        header: 'Name',
        minSize: 250,
        Header: () => (
          <TooltipHeader
            tooltip="The name of the independent variable."
            title="Name"
          />
        ),
        Cell({ row: { original } }) {
          return original.name;
        },
      },
      {
        id: 'marginal_effect',
        header: 'Marginal Effect',
        minSize: 150,
        size: 150,
        accessorFn: (coef) => coef.value * 100,
        enableSorting: true,
        Header: () => (
          <TooltipHeader
            tooltip="The marginal effect of the independent variable expressed as probabilities."
            title="Marginal Effect"
          />
        ),
        Cell({ row: { original } }) {
          if (original.value == null) return null;
          return `${formatNumber(original.value * 100)}%`;
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
            tooltip="The standard error of the marginal effect. A large standard error indicates that the effect of this variable is uncertain or that the data doesn't provide strong evidence for the effect of that variable."
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
        Header: () => (
          <TooltipHeader
            tooltip="The result of a Wald test to check if the marginal effect is not zero. Consider interpreting this statistic as p values or confidence levels instead. It is possibe for a variable to have significant coefficient but insignificant marginal effect, or vice versa."
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
            tooltip="The likelihood of observing the data with the assumption that the population marginal effect of this independent variable is zero; as in, the independent variable doesn't have an effect on the dependent variable at all."
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
            tooltip="The probability that the population marginal effect is not zero; which means that the independent variable has a statistically significant effect on the dependent variable."
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
            tooltip="The interval that has a 95% chance to contain the population marginal effect. A wide confidence interval indicates that the effect of the coefficient is uncertain. A confidence interval that crosses the zero-line (goes from negative to positive) indicates that the effect of the coefficient is ambiguous - it's not clear if it has a positive or negative effect on the dependent variable."
            title="Confidence Interval"
          />
        ),
        Cell({ row: { original } }) {
          if (original.confidence_interval == null) return null;
          return formatProbabilityConfidenceInterval(
            original.confidence_interval,
          );
        },
      },
    ];
    return columns;
  }, []);
}

// region Marginal Effects

interface MarginalEffectsTableRendererProps {
  marginalEffects: RegressionCoefficientModel[];
}

export function MarginalEffectsTableRenderer(
  props: MarginalEffectsTableRendererProps,
) {
  const { marginalEffects } = props;
  const columns = useMarginalEffectsTableColumns();
  const table = useMantineReactTable({
    data: marginalEffects,
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
  facets: MultinomialLogisticRegressionMarginalEffectsFacetResultModel[];
}

export function MarginalEffectsPerFacetTableRenderer(
  props: RegressionCoefficientsPerFacetTableRendererProps,
) {
  const { facets } = props;
  const columns = useMarginalEffectsTableColumns();
  const rows = React.useMemo<RegressionCoefficientModel[]>(() => {
    return facets
      .map((facet) => {
        return facet.marginal_effects.map((coef) => {
          return {
            ...coef,
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
