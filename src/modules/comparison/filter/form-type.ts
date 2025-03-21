import { ReplaceKeys } from '@/common/utils/types';
import {
  tableFilterFormSchema,
  TableFilterFormType,
} from '@/modules/filter/drawer/form-type';
import * as Yup from 'yup';

export const comparisonFilterFormSchema = (uniqueNames: string[]) =>
  Yup.object({
    name: Yup.string().required().notOneOf(uniqueNames),
    filter: tableFilterFormSchema,
  });

export type ComparisonFilterFormType = ReplaceKeys<
  Yup.InferType<ReturnType<typeof comparisonFilterFormSchema>>,
  {
    filter: TableFilterFormType;
  }
>;
