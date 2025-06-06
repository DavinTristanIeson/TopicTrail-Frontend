import * as Yup from 'yup';
import {
  regressionInputSchema,
  CommonRegressionConfigForm,
} from './regression-common';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import {
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
  ORDERED_CATEGORICAL_SCHEMA_COLUMN_TYPES,
} from '@/api/project';
import { without } from 'lodash-es';
import { TableUniqueValueSelectField } from '@/modules/filter/select/select-unique-values';
import { useFormContext, useWatch } from 'react-hook-form';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import { yupNullableString } from '@/common/utils/form';
import RHFField from '@/components/standard/fields';
import { Alert } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';

export const linearRegressionInputSchema = regressionInputSchema.shape({
  standardized: Yup.boolean().required().default(true),
});

export type LinearRegressionConfigType = Yup.InferType<
  typeof linearRegressionInputSchema
>;

export function LinearRegressionConfigForm() {
  return (
    <CommonRegressionConfigForm
      supportedTypes={[SchemaColumnTypeEnum.Continuous]}
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

const MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_COLUMN_TYPES = without(
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
  SchemaColumnTypeEnum.Boolean,
);
export function OneVsRestLogisticRegressionConfigForm() {
  return (
    <CommonRegressionConfigForm
      supportedTypes={MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_COLUMN_TYPES}
    />
  );
}

export const multinomialLogisticRegressionInputSchema =
  regressionInputSchema.shape({
    reference_dependent: yupNullableString,
  });
export type MultinomialLogisticRegressionConfigType = Yup.InferType<
  typeof multinomialLogisticRegressionInputSchema
>;

function MultinomialLogisticRegressionFormReferenceDependentField() {
  const { control } = useFormContext<MultinomialLogisticRegressionConfigType>();
  const project = React.useContext(ProjectContext);
  const column = useWatch({
    name: 'target',
    control,
  });
  if (!column) return;
  return (
    <TableUniqueValueSelectField
      name="reference_dependent"
      label="Reference Dependent Variable Level"
      description="The level of the dependent variable that is used as the reference."
      required
      column={column}
      projectId={project.id}
    />
  );
}

export function MultinomialLogisticRegressionConfigForm() {
  const { setValue } =
    useFormContext<MultinomialLogisticRegressionConfigType>();
  return (
    <CommonRegressionConfigForm
      supportedTypes={MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_COLUMN_TYPES}
      onChangeColumn={() => {
        setValue('reference_dependent', null as any);
      }}
      Top={
        <Alert title="Warning" color="yellow" icon={<Warning />}>
          Multinomial Logistic Regression may take a very long time fitting to
          the data if there are too many independent variables and/or dependent
          variable levels. For example, having 100 independent variables and 100
          dependent variable levels means that the Multinomial Logistic
          Regression model has to fit 100 x 99 = 9900 parameters. If there are
          too many independent variables, please consider merging them into
          logical groups to reduce the number of predictors. If there are too
          many dependent variable levels, consider manually preprocessing the
          dependent variable levels beforehand to reduce the number of levels;
          or use Logistic Regression to predict the possibility of each level
          individually.
        </Alert>
      }
      Bottom={<MultinomialLogisticRegressionFormReferenceDependentField />}
    />
  );
}

export function OrdinalRegressionConfigForm() {
  return (
    <CommonRegressionConfigForm
      supportedTypes={ORDERED_CATEGORICAL_SCHEMA_COLUMN_TYPES}
    />
  );
}
