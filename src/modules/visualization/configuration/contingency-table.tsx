import { CATEGORICAL_SCHEMA_COLUMN_TYPES } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
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
  const supportedColumns = React.useMemo(() => {
    return project.config.data_schema.columns.filter((column) =>
      CATEGORICAL_SCHEMA_COLUMN_TYPES.includes(
        column.type as SchemaColumnTypeEnum,
      ),
    );
  }, [project.config.data_schema.columns]);
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
