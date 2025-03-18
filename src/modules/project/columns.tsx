import React from 'react';
import { ProjectContext } from './context';
import { SchemaColumnModel } from '@/api/project';
import { useWatch } from 'react-hook-form';

export function useProjectColumn(
  columnName: string,
): SchemaColumnModel | undefined {
  const project = React.useContext(ProjectContext)!;
  return project.config.data_schema.columns.find(
    (column) => column.name === columnName,
  );
}

export function useProjectColumnField(
  columnFieldName: string,
): SchemaColumnModel | undefined {
  const columnName = useWatch({
    name: columnFieldName,
  });
  return useProjectColumn(columnName);
}
