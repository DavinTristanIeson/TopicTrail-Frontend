import { SchemaColumnModel } from '@/api/project';
import { PaginationMetaModel } from '@/api/table';
import React from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import {
  useSchemaColumnToMantineReactTableAdapter,
  useTableStateToMantineReactTableAdapter,
} from './adapter';

interface TableRendererComponentProps {
  columns: SchemaColumnModel[];
  data: Record<string, any>[];
  meta: PaginationMetaModel;
  isFetching: boolean;
}

export default function TableRendererComponent(
  props: TableRendererComponentProps,
) {
  const { data, columns, meta, isFetching } = props;
  const tableColumns = useSchemaColumnToMantineReactTableAdapter(columns);
  const tableProps = useTableStateToMantineReactTableAdapter({
    meta,
    isFetching,
  });
  console.log('RERENDER');
  const table = useMantineReactTable({
    data,
    columns: tableColumns,
    ...tableProps,
    // Column actions
    enableColumnDragging: true,
    enableColumnOrdering: true,
    enableColumnFilters: false,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableGlobalFilter: false,
    // Virtualization
    enableColumnVirtualization: columns.length > 12,
    enableRowVirtualization: data.length > 50,
    enableStickyHeader: true,
  });

  return <MantineReactTable table={table} layoutMode={'grid-no-grow' as any} />;
}
