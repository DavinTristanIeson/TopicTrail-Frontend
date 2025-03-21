import { TableFilterTypeEnum } from '@/common/constants/enum';
import {
  yupNullableArray,
  yupNullableMixed,
  yupNullableString,
} from '@/common/utils/form';
import * as Yup from 'yup';

const isAmong = (candidates: TableFilterTypeEnum[]) => {
  return (value: TableFilterTypeEnum) => candidates.includes(value);
};

const tableFilterFormSchemaBuilder = {
  type: Yup.string().oneOf(Object.values(TableFilterTypeEnum)).required(),
  target: yupNullableString.when('type', {
    is(value: TableFilterTypeEnum) {
      return [
        TableFilterTypeEnum.And,
        TableFilterTypeEnum.Or,
        TableFilterTypeEnum.Not,
      ].includes(value);
    },
    then: (schema) => schema.strip(),
    otherwise: (schema) => schema.required(),
  }),
  value: yupNullableMixed.when('type', {
    is: isAmong([
      TableFilterTypeEnum.EqualTo,
      TableFilterTypeEnum.GreaterThan,
      TableFilterTypeEnum.GreaterThanOrEqualTo,
      TableFilterTypeEnum.LessThan,
      TableFilterTypeEnum.LessThanOrEqualTo,
      TableFilterTypeEnum.HasText,
    ]),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),
  values: yupNullableArray.of(Yup.mixed().required()).when('type', {
    is: isAmong([
      TableFilterTypeEnum.IsOneOf,
      TableFilterTypeEnum.Excludes,
      TableFilterTypeEnum.Includes,
      TableFilterTypeEnum.Only,
    ]),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),
};

(tableFilterFormSchemaBuilder as any).operands = yupNullableArray
  .of(Yup.lazy(() => Yup.object(tableFilterFormSchemaBuilder)))
  .when('type', {
    is: isAmong([TableFilterTypeEnum.And, TableFilterTypeEnum.Or]),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  });

(tableFilterFormSchemaBuilder as any).operand = yupNullableArray
  .of(Yup.lazy(() => Yup.object(tableFilterFormSchemaBuilder)))
  .when('type', {
    is: TableFilterTypeEnum.Not,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  });

export const tableFilterFormSchema = Yup.object(tableFilterFormSchemaBuilder);

export type TableFilterFormType = Yup.InferType<
  typeof tableFilterFormSchema
> & {
  operands?: TableFilterFormType[];
  operand?: TableFilterFormType[];
};

export const defaultTableFilterFormValues: TableFilterFormType = {
  type: TableFilterTypeEnum.And,
  operands: [],
};
