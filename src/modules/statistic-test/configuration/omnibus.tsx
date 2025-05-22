import {
  OmnibusStatisticTestMethodEnum,
  SchemaColumnTypeEnum,
} from '@/common/constants/enum';
import * as Yup from 'yup';

import React from 'react';

import { Stack } from '@mantine/core';
import { GroupStatisticMethodSelectField } from './select-statistic-test-method';
import { useProjectColumnField } from '@/modules/project/context';
import {
  ExcludeOverlappingRowsCheckbox,
  StatisticTestProjectColumnSelectField,
} from './utils';

export const omnibusStatisticTestFormSchema = Yup.object({
  column: Yup.string().required(),
  statistic_test_preference: Yup.string()
    .oneOf(Object.values(OmnibusStatisticTestMethodEnum))
    .required(),
  exclude_overlapping_rows: Yup.boolean().required().default(true),
});

export type OmnibusStatisticTestConfig = Yup.InferType<
  typeof omnibusStatisticTestFormSchema
>;

export function OmnibusStatisticTestConfigForm() {
  const columnType = useProjectColumnField('column')?.type as
    | SchemaColumnTypeEnum
    | undefined;
  return (
    <Stack>
      <StatisticTestProjectColumnSelectField />
      {columnType && (
        <GroupStatisticMethodSelectField
          name="statistic_test_preference"
          type="select"
          label="Statistic Test"
          className="flex-1"
          description="What test method do you want to use in this statistic test?"
          columnType={columnType}
          required
        />
      )}
      <ExcludeOverlappingRowsCheckbox />
    </Stack>
  );
}
