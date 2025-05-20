import * as Yup from 'yup';

import React from 'react';

import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import {
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
  filterProjectColumnsByType,
} from '@/api/project';

export const contingencyTableFormSchema = Yup.object({
  column: Yup.string().required(),
});

export type ContingencyTableConfig = Yup.InferType<
  typeof contingencyTableFormSchema
>;

export function ContingencyTableConfigForm() {
  const project = React.useContext(ProjectContext);
  const columns = filterProjectColumnsByType(
    project,
    CATEGORICAL_SCHEMA_COLUMN_TYPES,
  );
  return (
    <ProjectColumnSelectField
      data={columns}
      name="column"
      label="Target"
      required
      error={
        columns.length === 0
          ? 'There are no columns in your dataset that supports statistic tests.'
          : undefined
      }
      description="The column that will be used for the statistic test."
    />
  );
}
