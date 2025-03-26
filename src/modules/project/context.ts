import {
  ProjectModel,
  SchemaColumnModel,
  TextualSchemaColumnModel,
} from '@/api/project';
import React from 'react';

export const ProjectContext = React.createContext<ProjectModel>(
  undefined as any,
);

export const SchemaColumnContext = React.createContext<SchemaColumnModel>(
  undefined as any,
);

export function useCurrentTextualColumn(): TextualSchemaColumnModel {
  return React.useContext(SchemaColumnContext) as TextualSchemaColumnModel;
}
