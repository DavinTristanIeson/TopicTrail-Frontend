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
  console.log(props.data);
  // TODO: Hansen
  return <></>;
}
