import {
  EffectSizeMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import * as Yup from 'yup';

import React from 'react';

import { Group, Stack } from '@mantine/core';
import { ComparisonSubdatasetSelectField } from '@/modules/comparison/subdatasets/select-subdataset';
import {
  ExcludeOverlappingRowsCheckbox,
  StatisticTestMethodFormBody,
  StatisticTestProjectColumnSelectField,
} from './utils';

export const twoSampleStatisticTestFormSchema = Yup.object({
  column: Yup.string().required().default(''),
  group1: Yup.string().required().default(''),
  group2: Yup.string().required().default(''),
  statistic_test_preference: Yup.string()
    .oneOf(Object.values(StatisticTestMethodEnum))
    .required()
    .default(null),
  effect_size_preference: Yup.string()
    .oneOf(Object.values(EffectSizeMethodEnum))
    .required()
    .default(null),
  exclude_overlapping_rows: Yup.boolean().required().default(true),
});

export type TwoSampleStatisticTestConfig = Yup.InferType<
  typeof twoSampleStatisticTestFormSchema
>;

export function TwoSampleStatisticTestConfigForm() {
  return (
    <Stack>
      <StatisticTestProjectColumnSelectField />
      <Group className="w-full">
        <ComparisonSubdatasetSelectField
          name="group1"
          className="flex-1"
          label="Group 1"
          withWholeDataset={false}
        />
        <ComparisonSubdatasetSelectField
          name="group2"
          className="flex-1"
          label="Group 2"
          withWholeDataset={false}
        />
      </Group>
      <StatisticTestMethodFormBody />
      <ExcludeOverlappingRowsCheckbox />
    </Stack>
  );
}
