import { SchemaColumnModel } from '@/api/project';
import { TableSortModel } from '@/api/table';
import React from 'react';
import { Text } from '@mantine/core';

interface TableRendererComponentProps {
  columns: SchemaColumnModel[];
  data: Record<string, any>[];
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
}

export default function TableRendererComponent(
  props: TableRendererComponentProps,
) {
  const { data } = props;
  // TODO: Hansen
  return (
    <>
      {data.map((row, index) => (
        <Text key={index}>{JSON.stringify(row)}</Text>
      ))}
    </>
  );
}
