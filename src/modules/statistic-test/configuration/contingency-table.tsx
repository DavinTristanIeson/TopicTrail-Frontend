import * as Yup from 'yup';

import React from 'react';

import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import {
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
  filterProjectColumnsByType,
} from '@/api/project';
import { ExcludeOverlappingRowsCheckbox } from './utils';
import { Stack } from '@mantine/core';

export const binaryContingencyTableFormSchema = Yup.object({
  column: Yup.string().required().default(''),
});

export type BinaryContingencyTableConfig = Yup.InferType<
  typeof contingencyTableFormSchema
>;

export function BinaryContingencyTableConfigForm() {
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

export const contingencyTableFormSchema = Yup.object({
  column: Yup.string().required().default(''),
  exclude_overlapping_rows: Yup.boolean().required().default(true),
});

export type ContingencyTableConfig = Yup.InferType<
  typeof contingencyTableFormSchema
>;

export function ContingencyTableConfigForm() {
  return (
    <Stack>
      <BinaryContingencyTableConfigForm />
      <ExcludeOverlappingRowsCheckbox />
    </Stack>
  );
}
