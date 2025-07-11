import { Group, Stack } from '@mantine/core';
import * as Yup from 'yup';
import {
  EffectSizeMethodEnum,
  OmnibusStatisticTestMethodEnum,
  SchemaColumnTypeEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import React from 'react';
import {
  ExcludeOverlappingRowsCheckbox,
  StatisticTestMethodFormBody,
  StatisticTestOverlappingSubdatasetsWarning,
  StatisticTestProjectColumnSelectField,
} from './utils';
import { ComparisonSubdatasetSelectField } from '@/modules/comparison/subdatasets/select-subdataset';
import { useProjectColumnField } from '@/modules/project/context';
import { GroupStatisticMethodSelectField } from './select-statistic-test-method';

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
      <StatisticTestOverlappingSubdatasetsWarning />
      <StatisticTestProjectColumnSelectField
        resets={['statistic_test_preference', 'effect_size_preference']}
      />
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
      <StatisticTestOverlappingSubdatasetsWarning />
      <StatisticTestProjectColumnSelectField
        resets={['statistic_test_preference']}
      />
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
  typeof pairwiseStatisticTestFormSchema
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
