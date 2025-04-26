import {
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
  filterProjectColumnsByType,
} from '@/api/project';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import React from 'react';
import * as Yup from 'yup';

export const VisualizationContingencyTableConfigSchema = Yup.object({
  target: Yup.string().required(),
});

export type VisualizationContingencyTableConfigType = Yup.InferType<
  typeof VisualizationContingencyTableConfigSchema
>;

export function VisualizationContingencyTableConfigForm() {
  const project = React.useContext(ProjectContext);
  const supportedColumns = filterProjectColumnsByType(
    project,
    CATEGORICAL_SCHEMA_COLUMN_TYPES,
  );
  return (
    <ProjectColumnSelectField
      name="config.target"
      data={supportedColumns}
      label="Target"
      description="The unique values of this column will be used as the columns in the contingency table."
      required
    />
  );
}
