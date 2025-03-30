import { SchemaColumnModel } from '@/api/project';
import { PaginationMetaModel } from '@/api/table';
import React from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import {
  MantineReactTableBehaviors,
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
  const table = useMantineReactTable({
    data,
    columns: tableColumns as any,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    ...MantineReactTableBehaviors.Virtualized(data, columns),
    ...tableProps,
  });

  return <MantineReactTable table={table} />;
}
