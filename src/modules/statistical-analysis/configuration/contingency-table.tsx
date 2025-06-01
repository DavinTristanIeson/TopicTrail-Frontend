import * as Yup from 'yup';

import React from 'react';

import {
  ExcludeOverlappingRowsCheckbox,
  StatisticTestMethodFormBody,
  StatisticTestOverlappingSubdatasetsWarning,
  StatisticTestProjectColumnSelectField,
} from './utils';
import { Stack } from '@mantine/core';

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
      <StatisticTestProjectColumnSelectField
        resets={['statistic_test_preference', 'effect_size_preference']}
      />
      <StatisticTestMethodFormBody />
      <ExcludeOverlappingRowsCheckbox />
    </Stack>
  );
}
