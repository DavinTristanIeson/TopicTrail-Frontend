import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import {
  REGRESSION_MODEL_QUIRKS,
  RegressionModelType,
  UltimateRegressionCoefficientModel,
} from './types';
import React from 'react';
import { formatNumber } from '@/common/utils/number';
import { Text, Tooltip } from '@mantine/core';
import { formatConfidenceInterval, pValueToConfidenceLevel } from './utils';
import {
  LogisticRegressionCoefficientModel,
  MultinomialLogisticRegressionFacetResultModel,
  OrdinalRegressionThresholdModel,
} from '@/api/statistical-analysis';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';

interface UseCoefficientsTableColumnsProps {
  modelType: RegressionModelType;
}

interface TooltipHeaderProps {
  tooltip: string;
  title: string;
}

function TooltipHeader(props: TooltipHeaderProps) {
  return (
    <Tooltip label={props.tooltip} maw={300}>
      <Text inherit>{props.title}</Text>
    </Tooltip>
  );
}

function useCoefficientsTableColumns(props: UseCoefficientsTableColumnsProps) {
  const { modelType } = props;
  return React.useMemo<
    MRT_ColumnDef<UltimateRegressionCoefficientModel>[]
  >(() => {
    const withOdds = !!REGRESSION_MODEL_QUIRKS[modelType].withOdds;
    const columns: MRT_ColumnDef<UltimateRegressionCoefficientModel>[] = [
      {
        id: 'coefficient',
        header: 'Coefficient',
        minSize: 100,
        Header: () => (
          <TooltipHeader
            tooltip="The actual parameter value of the model."
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
        minSize: 100,
        Header: () => (
          <TooltipHeader
            tooltip="The standard error of the model. A large standard error indicates that the effect of this coefficient is uncertain or that the data doesn't provide strong evidence for the effect of that variable."
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
        minSize: 100,
        Header: () =>
          modelType === RegressionModelType.Linear ? (
            <TooltipHeader
              tooltip="The result of a t-test to check if the population coefficient is not zero. Consider interpreting this statistic as p values or confidence levels instead."
              title="t Statistic"
            />
          ) : (
            <TooltipHeader
              tooltip="The result of a Wald test to check if the population coefficient is not zero. Consider interpreting this statistic as p values or confidence levels instead."
              title="t Statistic"
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
        minSize: 100,
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
        header: 'Confidence Level',
        minSize: 100,
        Header: () => (
          <TooltipHeader
            tooltip="The probability that the population coefficient is not zero; which means that the independent variable has a statistically significant effect on the dependent variable."
            title="Confidence Level"
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
        minSize: 200,
        Header: () => (
          <TooltipHeader
            tooltip="The interval that has a 95% chance to contain the population coefficient. A wide confidence interval indicates that the effect of the coefficient is uncertain. A confidence interval that crosses the zero-line (goes from negative to positive) indicates that the effect of the coefficient is ambiguous - it's not clear if it has a positive or negative effect on the dependent variable."
            title="Confidence Level"
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
          minSize: 100,
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
          minSize: 200,
          Header: () => (
            <TooltipHeader
              tooltip="The interval that has a 95% chance to contain the actual odds ratio."
              title="Odds Ratio"
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

interface RegressionCoefficientsTableProps {
  modelType: RegressionModelType;
  coefficients: UltimateRegressionCoefficientModel[];
  intercept: UltimateRegressionCoefficientModel | null;
}

export function RegressionCoefficientsTable(
  props: RegressionCoefficientsTableProps,
) {
  const { modelType, coefficients, intercept } = props;
  const columns = useCoefficientsTableColumns({
    modelType,
  });
  const rows = React.useMemo(
    () => (intercept ? [intercept, ...coefficients] : coefficients),
    [coefficients, intercept],
  );
  const table = useMantineReactTable({
    data: rows,
    columns: columns,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    enablePagination: false,
    layoutMode: 'grid',
  });
  return <MantineReactTable table={table} />;
}

interface RegressionCoefficientsPerFacetTableProps {
  facets: MultinomialLogisticRegressionFacetResultModel[];
}

export function RegressionCoefficientsPerFacetTable(
  props: RegressionCoefficientsPerFacetTableProps,
) {
  const { facets } = props;
  const columns = useCoefficientsTableColumns({
    modelType: RegressionModelType.MultinomialLogistic,
  });
  const rows = React.useMemo(() => {
    return facets
      .map((facet) => {
        return [facet.intercept, ...facet.coefficients].map((coef) => {
          return {
            ...coef,
            level: facet.level,
          };
        });
      })
      .flat();
  }, [facets]);
  const columnsWithLevel = React.useMemo<
    MRT_ColumnDef<UltimateRegressionCoefficientModel>[]
  >(() => {
    return [
      {
        id: 'level',
        header: 'Level',
        minSize: 100,
        Header: () => (
          <TooltipHeader
            tooltip="The dependent variable level associated with this coefficient."
            title="Level"
          />
        ),
        Cell({ row: { original } }) {
          return (original as any).level;
        },
      },
      ...columns,
    ];
  }, [columns]);
  const table = useMantineReactTable({
    data: rows,
    columns: columnsWithLevel,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    enablePagination: false,
    layoutMode: 'grid',
  });
  return <MantineReactTable table={table} />;
}

interface RegressionThresholdsTableProps {
  thresholds: OrdinalRegressionThresholdModel[];
}

export function RegressionThresholdsTable(
  props: RegressionThresholdsTableProps,
) {
  const { thresholds } = props;
  const columns = React.useMemo<
    MRT_ColumnDef<OrdinalRegressionThresholdModel>[]
  >(() => {
    return [
      {
        id: 'from_level',
        header: 'From Level',
        minSize: 150,
        Cell({ row: { original } }) {
          return original.from_level;
        },
      },
      {
        id: 'to_level',
        header: 'To Level',
        minSize: 150,
        Cell({ row: { original } }) {
          return original.to_level;
        },
      },
      {
        id: 'threshold_value',
        header: 'Threshold Value',
        minSize: 100,
        Header: () => (
          <TooltipHeader
            tooltip="The threshold that must be reached in latent variable space to cross from the lower level to the upper level."
            title="Threshold Value"
          />
        ),
        Cell({ row: { original } }) {
          if (original.value == null) return null;
          return formatNumber(original.value);
        },
      },
    ];
  }, []);

  const table = useMantineReactTable({
    data: thresholds,
    columns: columns,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    enablePagination: false,
    layoutMode: 'grid',
  });
  return <MantineReactTable table={table} />;
}
