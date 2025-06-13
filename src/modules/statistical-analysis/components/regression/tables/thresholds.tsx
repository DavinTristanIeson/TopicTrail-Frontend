import { OrdinalRegressionThresholdModel } from '@/api/statistical-analysis';
import { formatNumber } from '@/common/utils/number';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';
import {
  type MRT_ColumnDef,
  useMantineReactTable,
  MantineReactTable,
} from 'mantine-react-table';
import React from 'react';
import { TooltipHeader } from './common';

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
        minSize: 200,
        Cell({ row: { original } }) {
          return original.from_level;
        },
      },
      {
        id: 'to_level',
        header: 'To Level',
        minSize: 200,
        Cell({ row: { original } }) {
          return original.to_level;
        },
      },
      {
        id: 'threshold_value',
        header: 'Threshold Value',
        minSize: 120,
        size: 120,
        enableSorting: true,
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
