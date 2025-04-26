import {
  findProjectColumn,
  ProjectModel,
  SchemaColumnModel,
  TextualSchemaColumnModel,
} from '@/api/project';
import React from 'react';
import { useWatch } from 'react-hook-form';

export const ProjectContext = React.createContext<ProjectModel>(
  undefined as any,
);

export const SchemaColumnContext = React.createContext<SchemaColumnModel>(
  undefined as any,
);

export function useCurrentTextualColumn(): TextualSchemaColumnModel {
  return React.useContext(SchemaColumnContext) as TextualSchemaColumnModel;
}

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
