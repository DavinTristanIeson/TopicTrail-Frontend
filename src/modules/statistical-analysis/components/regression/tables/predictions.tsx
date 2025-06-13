import {
  MultinomialLogisticRegressionPredictionResultModel,
  OrdinalRegressionPredictionResultModel,
} from '@/api/statistical-analysis';
import React from 'react';
import { SHARED_REGRESSION_COEFFICIENT_MRT_PROPS } from './common';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import { formatNumber } from '@/common/utils/number';

type MultinomialPrediction =
  | MultinomialLogisticRegressionPredictionResultModel
  | OrdinalRegressionPredictionResultModel;
interface NamedMultinomialPrediction {
  variable: string;
  prediction: MultinomialPrediction;
}
interface NamedOrdinalPrediction {
  variable: string;
  prediction: OrdinalRegressionPredictionResultModel;
}

interface MultinomialPredictionProbabilityDistributionTableProps {
  baselinePrediction: MultinomialPrediction;
  predictions: NamedMultinomialPrediction[];
  levels: {
    name: string;
  }[];
  cumulative: boolean;
}

function useMultinomialPredictionProbabilityDistributionTableColumns(
  columns: string[],
  cumulative: boolean,
) {
  return React.useMemo<MRT_ColumnDef<NamedMultinomialPrediction>[]>(() => {
    const perLevelColumns: MRT_ColumnDef<NamedMultinomialPrediction>[] =
      columns.map((column, index) => {
        return {
          id: column,
          header: column,
          minSize: 150,
          size: 150,
          enableSorting: true,
          accessorFn(original) {
            const probability: number = cumulative
              ? (original.prediction as OrdinalRegressionPredictionResultModel)
                  .cumulative_probabilities[index]!
              : original.prediction.probabilities[index]!;
            return probability * 100;
          },
          Cell({ renderedCellValue }) {
            return `${formatNumber(renderedCellValue as number)}%`;
          },
        };
      });
    const variableNameColumn: MRT_ColumnDef<NamedMultinomialPrediction> = {
      id: 'variable',
      header: 'Independent Variable',
      minSize: 200,
      size: 200,
      accessorFn(original) {
        return original.variable;
      },
    };
    return [variableNameColumn, ...perLevelColumns];
  }, [columns, cumulative]);
}

export function MultinomialPredictionProbabilityDistributionTable(
  props: MultinomialPredictionProbabilityDistributionTableProps,
) {
  const { baselinePrediction, cumulative, levels, predictions } = props;
  const columns = useMultinomialPredictionProbabilityDistributionTableColumns(
    levels.map((level) => level.name),
    cumulative,
  );
  const table = useMantineReactTable({
    data: [
      { variable: 'Baseline', prediction: baselinePrediction },
      ...predictions,
    ],
    columns: columns,
    ...SHARED_REGRESSION_COEFFICIENT_MRT_PROPS,
    getRowId: React.useCallback((row: NamedMultinomialPrediction) => {
      return row.variable;
    }, []),
  });
  return <MantineReactTable table={table} />;
}

interface OrdinalLatentScoreTableProps {
  baselinePrediction: MultinomialPrediction;
  predictions: NamedMultinomialPrediction[];
}

export function OrdinalLatentScoreTable(props: OrdinalLatentScoreTableProps) {
  const { baselinePrediction, predictions } = props;
  const table = useMantineReactTable({
    data: [
      { variable: 'Baseline', data: baselinePrediction },
      ...predictions,
    ] as NamedOrdinalPrediction[],
    columns: React.useMemo<MRT_ColumnDef<NamedOrdinalPrediction>[]>(() => {
      return [
        {
          id: 'variable',
          header: 'Independent Variable',
          minSize: 150,
          size: 150,
          enableSorting: true,
          Cell({ row: { original } }) {
            return original.variable;
          },
        },
        {
          id: 'variable',
          header: 'Latent Score',
          minSize: 150,
          size: 150,
          enableSorting: true,
          Cell({ row: { original } }) {
            return original.prediction.latent_score;
          },
        },
      ];
    }, []),
    ...SHARED_REGRESSION_COEFFICIENT_MRT_PROPS,
    getRowId: React.useCallback((prediction: NamedMultinomialPrediction) => {
      return prediction.variable;
    }, []),
  });
  return <MantineReactTable table={table} />;
}
