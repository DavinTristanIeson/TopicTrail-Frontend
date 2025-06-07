import * as Yup from 'yup';
import {
  regressionInputSchema,
  CommonRegressionConfigForm,
  DependentVariableSelectField,
} from './regression-common';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import React from 'react';
import RHFField from '@/components/standard/fields';

export const linearRegressionInputSchema = regressionInputSchema.shape({
  target: Yup.string().required(),
  standardized: Yup.boolean().required().default(true),
});

export type LinearRegressionConfigType = Yup.InferType<
  typeof linearRegressionInputSchema
>;

export function LinearRegressionConfigForm() {
  return (
    <CommonRegressionConfigForm
      Top={
        <DependentVariableSelectField
          supportedTypes={[SchemaColumnTypeEnum.Continuous]}
        />
      }
      Bottom={
        <RHFField
          name="standardized"
          type="switch"
          label="Standardize dependent variable?"
          description="Should the values of the dependent variable be standardized? This means that the coefficients cannot be interpreted as absolute units but rather as standard deviations. It may help in comparing effect sizes for each independent variables or identifying which independent variable causes significant deviations."
        />
      }
    />
  );
}
