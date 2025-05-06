import {
  findProjectColumn,
  ProjectModel,
  SchemaColumnModel,
} from '@/api/project';
import React from 'react';
import { useWatch } from 'react-hook-form';

export const ProjectContext = React.createContext<ProjectModel>(
  undefined as any,
);

export function useProjectColumn(
  columnName: string,
): SchemaColumnModel | undefined {
  const project = React.useContext(ProjectContext);
  return findProjectColumn(project, columnName);
}

export function useProjectColumnField(
  columnFieldName: string,
): SchemaColumnModel | undefined {
  const columnName = useWatch({
    name: columnFieldName,
  });
  return useProjectColumn(columnName);
}
