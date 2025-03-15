import { SchemaColumnModel } from '@/api/project';
import { TableSortModel } from '@/api/table';
import React from 'react';

interface TableRendererComponentProps {
  columns: SchemaColumnModel[];
  data: Record<string, any>[];
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
}

export default function TableRendererComponent(
  props: TableRendererComponentProps,
) {
  for (const row of props.data) {
    console.log(JSON.stringify(row));
  }
  // TODO: Hansen
  return <></>;
}
