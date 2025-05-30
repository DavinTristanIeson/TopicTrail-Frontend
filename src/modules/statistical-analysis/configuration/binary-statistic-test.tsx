import {
  StatisticTestMethodEnum,
  EffectSizeMethodEnum,
} from '@/common/constants/enum';
import { Stack } from '@mantine/core';
import {
  StatisticTestProjectColumnSelectField,
  StatisticTestMethodFormBody,
} from './utils';
import * as Yup from 'yup';
import { CATEGORICAL_SCHEMA_COLUMN_TYPES } from '@/api/project';

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

export const binaryContingencyTableFormSchema = Yup.object({
  column: Yup.string().required().default(''),
});

export type BinaryContingencyTableConfig = Yup.InferType<
  typeof binaryContingencyTableFormSchema
>;

export function BinaryContingencyTableConfigForm() {
  return (
    <StatisticTestProjectColumnSelectField
      supportedTypes={CATEGORICAL_SCHEMA_COLUMN_TYPES}
    />
  );
}
