import * as Yup from 'yup';

import React from 'react';

import { CATEGORICAL_SCHEMA_COLUMN_TYPES } from '@/api/project';
import {
  ExcludeOverlappingRowsCheckbox,
  StatisticTestOverlappingSubdatasetsWarning,
  StatisticTestProjectColumnSelectField,
} from './utils';
import { Stack } from '@mantine/core';

export const binaryContingencyTableFormSchema = Yup.object({
  column: Yup.string().required().default(''),
});

export type BinaryContingencyTableConfig = Yup.InferType<
  typeof contingencyTableFormSchema
>;

export function BinaryContingencyTableConfigForm() {
  return (
    <StatisticTestProjectColumnSelectField
      supportedTypes={CATEGORICAL_SCHEMA_COLUMN_TYPES}
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
      <StatisticTestOverlappingSubdatasetsWarning />
      <BinaryContingencyTableConfigForm />
      <ExcludeOverlappingRowsCheckbox />
    </Stack>
  );
}
