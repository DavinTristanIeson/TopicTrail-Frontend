import { Stack } from '@mantine/core';
import * as Yup from 'yup';
import {
  EffectSizeMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import React from 'react';
import {
  ExcludeOverlappingRowsCheckbox,
  StatisticTestMethodFormBody,
  StatisticTestOverlappingSubdatasetsWarning,
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
});

export type BinaryStatisticTestConfig = Yup.InferType<
  typeof binaryStatisticTestFormSchema
>;

export function BinaryStatisticTestConfigForm() {
  return (
    <Stack>
      <StatisticTestProjectColumnSelectField
        resets={['statistic_test_preference', 'effect_size_preference']}
      />
      <StatisticTestMethodFormBody />
    </Stack>
  );
}

export const pairwiseStatisticTestFormSchema = Yup.object({
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

export type PairwiseStatisticTestConfig = Yup.InferType<
  typeof binaryStatisticTestFormSchema
>;

export function PairwiseStatisticTestConfigForm() {
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
