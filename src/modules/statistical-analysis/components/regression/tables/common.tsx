import { MantineReactTableBehaviors } from '@/modules/table/adapter';
import { Text, Tooltip, useMantineTheme } from '@mantine/core';
import { UltimateRegressionCoefficientModel } from '../types';
import { type MRT_ColumnDef, type MRT_RowData } from 'mantine-react-table';
import React from 'react';

interface TooltipHeaderProps {
  tooltip: string;
  title: string;
}

export function TooltipHeader(props: TooltipHeaderProps) {
  return (
    <Tooltip label={props.tooltip} maw={300}>
      <Text inherit>{props.title}</Text>
    </Tooltip>
  );
}

export function RowPinningColorProvider(props: React.PropsWithChildren) {
  const { colors: mantineColors } = useMantineTheme();
  return (
    <div
      style={
        {
          '--mrt-pinned-row-background-color': mantineColors.brand[1],
        } as React.CSSProperties
      }
    >
      {props.children}
    </div>
  );
}

export const SHARED_REGRESSION_COEFFICIENT_MRT_PROPS = {
  ...MantineReactTableBehaviors.Default,
  ...MantineReactTableBehaviors.Resizable,
  ...MantineReactTableBehaviors.ColumnActions,
  getRowId: (originalRow: UltimateRegressionCoefficientModel) => {
    return originalRow.name;
  },
  enablePagination: false,
  enableSorting: true,
  enableMultiSort: true,
  enableSortingRemoval: true,
  enableRowPinning: true,
  enableColumnActions: true,
  layoutMode: 'grid' as const,
};

export const SHARED_REGRESSION_MULTINOMIAL_COEFFICIENT_MRT_PROPS = {
  initialState: { grouping: ['level'] },
  ...MantineReactTableBehaviors.Default,
  ...MantineReactTableBehaviors.Resizable,
  ...MantineReactTableBehaviors.ColumnActions,
  getRowId: (originalRow: any) => {
    return `${originalRow.level}-${originalRow.name}`;
  },
  enablePagination: false,
  enableSorting: true,
  enableMultiSort: true,
  enableSortingRemoval: true,
  enableRowPinning: true,
  enableGrouping: true,
  enableColumnActions: true,
  layoutMode: 'grid' as const,
};

export function useDependentVariableLevelGroupingColumns<T extends MRT_RowData>(
  columns: MRT_ColumnDef<T>[],
): MRT_ColumnDef<T>[] {
  return React.useMemo(() => {
    return [
      {
        id: 'level',
        header: 'Level',
        minSize: 100,
        getGroupingValue(row) {
          return row.level;
        },
        Header: () => (
          <TooltipHeader
            tooltip="The dependent variable level associated with this coefficient."
            title="Level"
          />
        ),
        Cell({ row: { original } }) {
          return (original as any).level;
        },
      } as MRT_ColumnDef<T>,
      ...columns,
    ];
  }, [columns]);
}
