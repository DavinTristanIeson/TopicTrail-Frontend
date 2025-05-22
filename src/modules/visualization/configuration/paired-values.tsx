import * as Yup from 'yup';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import {
  ANALYZABLE_SCHEMA_COLUMN_TYPES,
  filterProjectColumnsByType,
} from '@/api/project';

export const VisualizationPairedValuesConfigSchema = Yup.object({
  column2: Yup.string().required(),
});

export type VisualizationPairedValuesConfigType = Yup.InferType<
  typeof VisualizationPairedValuesConfigSchema
>;

export function VisualizationPairedValuesConfigForm() {
  const project = React.useContext(ProjectContext);
  const columns = filterProjectColumnsByType(
    project,
    ANALYZABLE_SCHEMA_COLUMN_TYPES,
  );
  return (
    <ProjectColumnSelectField
      name="config.column2"
      type="select"
      label="Column 2"
      data={columns}
      required
      className="flex-1"
      description="Choose the second column to use as the x axis."
      allowDeselect={false}
    />
  );
}
