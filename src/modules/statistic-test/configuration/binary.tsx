import { Stack } from '@mantine/core';
import * as Yup from 'yup';
import {
  EffectSizeMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import React from 'react';
import {
  StatisticTestMethodFormBody,
  StatisticTestProjectColumnSelectField,
} from './utils';

export const binaryStatisticTestFormSchema = Yup.object({
  column: Yup.string().required().default(''),
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

export type BinaryStatisticTestConfig = Yup.InferType<
  typeof binaryStatisticTestFormSchema
>;

export function BinaryStatisticTestConfigForm() {
  return (
    <Stack>
      <StatisticTestProjectColumnSelectField />
      <StatisticTestMethodFormBody />
    </Stack>
  );
}
