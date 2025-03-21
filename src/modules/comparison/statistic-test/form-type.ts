import {
  EffectSizeMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import * as Yup from 'yup';

export const statisticTestFormSchema = Yup.object({
  column: Yup.string().required(),
  group1: Yup.string().required(),
  group2: Yup.string().required(),
  statistic_test_preference: Yup.string()
    .oneOf(Object.values(StatisticTestMethodEnum))
    .required(),
  effect_size_preference: Yup.string()
    .oneOf(Object.values(EffectSizeMethodEnum))
    .required(),
  exclude_overlapping_rows: Yup.boolean().required(),
});

export type StatisticTestFormType = Yup.InferType<
  typeof statisticTestFormSchema
>;
