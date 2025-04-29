import { ReplaceKeys } from '@/common/utils/types';
import {
  tableFilterFormSchema,
  TableFilterFormType,
} from '@/modules/filter/drawer/form-type';
import * as Yup from 'yup';

export const comparisonFilterFormSchema = Yup.object({
  name: Yup.string().required(),
  filter: tableFilterFormSchema,
  visible: Yup.boolean().default(true).required(),
});

export type ComparisonFilterFormType = ReplaceKeys<
  Yup.InferType<typeof comparisonFilterFormSchema>,
  {
    filter: TableFilterFormType;
  }
>;
