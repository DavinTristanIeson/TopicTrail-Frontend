import { yupNullableString } from '@/common/utils/form';
import {
  CommonRegressionConfigForm,
  DependentVariableSelectField,
  regressionInputSchema,
} from './regression-common';

import * as Yup from 'yup';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import { TableUniqueValueSelectField } from '@/modules/filter/select/select-unique-values';
import { Alert, Card, Fieldset, Stack, Text } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import RHFField from '@/components/standard/fields';
import { ComparisonStateItemModel } from '@/api/comparison';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { LoadUserDataSelectInput } from '@/modules/userdata/load-data';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import { identity } from 'lodash-es';

// region Enums

export enum MultinomialRegressionDependentVariableMode {
  Column = 'column',
  Subdatasets = 'subdatasets',
}
const MULTINOMIAL_REGRESSION_MODE_DICTIONARY = {
  [MultinomialRegressionDependentVariableMode.Column]: {
    label: 'Use Column Values',
    description:
      'Use the unique values of a column as the levels of the dependent variable.',
    value: MultinomialRegressionDependentVariableMode.Column,
  },
  [MultinomialRegressionDependentVariableMode.Subdatasets]: {
    label: 'Use Subdatasets',
    description:
      "If there are too many unique values inside the columns, or if you'd like more control over which rows are assigned to which categories, considering using subdatasets. The subdatasets must be mutually exclusive with each other.",
    value: MultinomialRegressionDependentVariableMode.Column,
  },
};

// region Form Type
export const multinomialRegressionInputSchema = regressionInputSchema.shape({
  dependent_variable_mode: Yup.string()
    .oneOf(Object.values(MultinomialRegressionDependentVariableMode))
    .required(),
  target: Yup.string().required(),
});

export const multinomialLogisticRegressionInputSchema =
  multinomialRegressionInputSchema.shape({
    reference_dependent: yupNullableString,
  });

export type MultinomialRegressionConfigType = Yup.InferType<
  typeof multinomialRegressionInputSchema
>;

type InternalMultinomialRegressionConfigType =
  MultinomialRegressionConfigType & {
    subdatasets: ComparisonStateItemModel[] | undefined;
  };

export type OrdinalRegressionConfigType = MultinomialRegressionConfigType;
export type MultinomialLogisticRegressionConfigType = Yup.InferType<
  typeof multinomialLogisticRegressionInputSchema
>;

const MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_COLUMN_TYPES = [
  SchemaColumnTypeEnum.Categorical,
  SchemaColumnTypeEnum.OrderedCategorical,
  SchemaColumnTypeEnum.Temporal,
  SchemaColumnTypeEnum.Topic,
];

// region Select Dependent Variable
function MultinomialSubdatasetsField() {
  const { control, clearErrors, setValue } =
    useFormContext<InternalMultinomialRegressionConfigType>();

  const [shownGroups, setShownGroups] = React.useState<
    ComparisonStateItemModel[]
  >([]);
  const userdataManagerProps = useComparisonStateDataManager({
    onApply: identity,
    state: null,
  });

  const { field, fieldState } = useController({
    name: 'target',
    control,
  });

  return (
    <>
      <Fieldset legend="Choose subdatasets">
        <Text size="sm" c="gray">
          Create the subdatasets you&apos;d like to use as the levels of the
          dependent variable from the &quot;Subdatasets&quot;. Afterwards, save
          those subdatasets from the &quot;Manage Subdatasets&quot; menu so that
          you can use them here.
        </Text>
        <LoadUserDataSelectInput
          data={userdataManagerProps.data}
          value={field.value}
          onChange={(data) => {
            field.onChange(data?.id ?? '');
            setValue('subdatasets', data?.data.groups);
            setShownGroups(data?.data?.groups ?? []);
            if (data) {
              clearErrors('target');
            }
          }}
        />
        {fieldState.error && (
          <Text size="sm" c="red">
            {fieldState.error.message}
          </Text>
        )}
      </Fieldset>
      <Stack>
        {shownGroups.map((tgt) => {
          return (
            <Card key={tgt.name}>
              <Text fw={500}>{tgt.name}</Text>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}

interface MultinomialDependentVariableFieldProps {
  supportedTypes: SchemaColumnTypeEnum[];
}

function MultinomialDependentVariableField(
  props: MultinomialDependentVariableFieldProps,
) {
  const { supportedTypes } = props;
  const renderOption = useDescriptionBasedRenderOption(
    MULTINOMIAL_REGRESSION_MODE_DICTIONARY,
  );
  const { control, setValue } =
    useFormContext<InternalMultinomialRegressionConfigType>();
  const dependentVariableMode = useWatch({
    name: 'dependent_variable_mode',
    control,
  });
  return (
    <>
      <RHFField
        type="select"
        name="dependent_variable_mode"
        data={Object.values(MULTINOMIAL_REGRESSION_MODE_DICTIONARY)}
        label="Dependent Variable Mode"
        description="The method used to get the levels of the dependent variable."
        required
        allowDeselect={false}
        renderOption={renderOption}
        onChange={() => {
          setValue('target', '');
        }}
      />
      {dependentVariableMode ===
      MultinomialRegressionDependentVariableMode.Column ? (
        <DependentVariableSelectField supportedTypes={supportedTypes} />
      ) : (
        <MultinomialSubdatasetsField />
      )}
    </>
  );
}

// region Multinomial Logistic - Dependent Variable

function MultinomialLogisticRegressionFormReferenceDependentField() {
  const { control } = useFormContext<
    MultinomialLogisticRegressionConfigType &
      InternalMultinomialRegressionConfigType
  >();
  const project = React.useContext(ProjectContext);
  const [target, mode, subdatasets] = useWatch({
    name: ['target', 'dependent_variable_mode', 'subdatasets'],
    control,
  });

  const commonProps = {
    name: 'reference_dependent',
    label: 'Reference Dependent Variable Level',
    description:
      'The level of the dependent variable that is used as the reference.',
    required: true,
  };

  if (mode === MultinomialRegressionDependentVariableMode.Column) {
    return (
      <TableUniqueValueSelectField
        {...commonProps}
        column={target as string}
        projectId={project.id}
      />
    );
  }
  if (mode === MultinomialRegressionDependentVariableMode.Subdatasets) {
    return (
      <RHFField
        type="select"
        {...commonProps}
        data={subdatasets?.map((item) => item.name)}
      />
    );
  }
}

// region Actual forms
export function MultinomialLogisticRegressionConfigForm() {
  return (
    <CommonRegressionConfigForm
      Top={
        <>
          <Alert title="Warning" color="yellow" icon={<Warning />}>
            Multinomial Logistic Regression may take a very long time fitting to
            the data if there are too many independent variables and/or
            dependent variable levels. For example, having 100 independent
            variables and 100 dependent variable levels means that the
            Multinomial Logistic Regression model has to fit 100 x 99 = 9900
            parameters. If there are too many independent variables, please
            consider merging them into logical groups to reduce the number of
            predictors. If there are too many dependent variable levels,
            consider manually preprocessing the dependent variable levels
            beforehand to reduce the number of levels; or use Logistic
            Regression to predict the possibility of each level individually.
          </Alert>
          <MultinomialDependentVariableField
            supportedTypes={
              MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_COLUMN_TYPES
            }
          />
        </>
      }
      Bottom={<MultinomialLogisticRegressionFormReferenceDependentField />}
    />
  );
}

export function OrdinalRegressionConfigForm() {
  return (
    <CommonRegressionConfigForm
      Top={
        <MultinomialDependentVariableField
          supportedTypes={
            MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_COLUMN_TYPES
          }
        />
      }
    />
  );
}
