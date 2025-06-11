import {
  yupNullableArray,
  yupNullableNumber,
  yupNullableString,
} from '@/common/utils/form';
import {
  CommonRegressionConfigForm,
  DependentVariableSelectField,
  regressionInputSchema,
  RegressionPenaltyField,
} from './regression-common';

import * as Yup from 'yup';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import { TableUniqueValueSelectField } from '@/modules/filter/select/select-unique-values';
import {
  Alert,
  Button,
  Card,
  Group,
  Spoiler,
  Stack,
  Text,
} from '@mantine/core';
import { Eye, Warning } from '@phosphor-icons/react';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import RHFField from '@/components/standard/fields';
import {
  ComparisonStateItemModel,
  NamedTableFilterModel,
} from '@/api/comparison';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { LoadUserDataSelectInput } from '@/modules/userdata/load-data';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import { identity } from 'lodash-es';
import { comparisonFilterFormSchema } from '@/modules/comparison/subdatasets/form-type';
import ReadonlyFilterDrawer from '@/modules/filter/drawer/readonly';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';

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
    value: MultinomialRegressionDependentVariableMode.Subdatasets,
  },
};

// region Form Type
export const multinomialRegressionInputSchema = regressionInputSchema.shape({
  dependent_variable_mode: Yup.string()
    .oneOf(Object.values(MultinomialRegressionDependentVariableMode))
    .required()
    .default(MultinomialRegressionDependentVariableMode.Column),
  target: Yup.string().required(),
  subdatasets: yupNullableArray.of(comparisonFilterFormSchema),
});

export const multinomialLogisticRegressionInputSchema =
  multinomialRegressionInputSchema.shape({
    reference_dependent: yupNullableString,
    penalty: yupNullableNumber,
  });

export const ordinalRegressionInputSchema =
  multinomialRegressionInputSchema.shape({
    penalty: yupNullableNumber,
  });

export type MultinomialRegressionConfigType = Yup.InferType<
  typeof multinomialRegressionInputSchema
>;
export type OrdinalRegressionConfigType = Yup.InferType<
  typeof ordinalRegressionInputSchema
>;

type InternalMultinomialRegressionConfigType =
  MultinomialRegressionConfigType & {
    subdatasets: ComparisonStateItemModel[] | undefined;
  };

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

  const userdataManagerProps = useComparisonStateDataManager({
    onApply: identity,
    state: null,
  });

  const { field, fieldState } = useController({
    name: 'subdatasets',
    control,
  });
  const { field: targetField, fieldState: targetFieldState } = useController({
    name: 'target',
    control,
  });

  const remote =
    React.useRef<ParametrizedDisclosureTrigger<NamedTableFilterModel> | null>(
      null,
    );

  const loadUserDataValue =
    userdataManagerProps.data.find((item) => item.name === targetField.value)
      ?.id ?? null;

  return (
    <>
      <LoadUserDataSelectInput
        data={userdataManagerProps.data}
        defaultValue={loadUserDataValue}
        onChange={(data) => {
          field.onChange(data?.data.groups ?? null);
          targetField.onChange(data?.name ?? '');
          setValue('reference_dependent' as any, null);
          if (data) {
            clearErrors('subdatasets');
            clearErrors('target');
          }
        }}
        selectProps={{
          label: 'Subdatasets as Dependent Variable',
          description: `Create the subdatasets you'd like to use as the levels of the
        dependent variable from the "Subdatasets". Afterwards, save
        those subdatasets from the "Manage Subdatasets" menu so that
        you can use them here.`,
          allowDeselect: false,
        }}
      />
      <Text size="sm" c="red">
        {fieldState.error?.message ?? targetFieldState.error?.message}
      </Text>
      <ReadonlyFilterDrawer ref={remote} />
      <Spoiler hideLabel="Hide Subdatasets" showLabel="Show Subdatasets">
        <Stack>
          {field.value?.map((tgt) => {
            return (
              <Card key={tgt.name}>
                <Group justify="space-between">
                  <Text fw={500}>{tgt.name}</Text>
                  <Button
                    leftSection={<Eye />}
                    variant="outline"
                    onClick={() => {
                      remote.current?.open(tgt as NamedTableFilterModel);
                    }}
                  >
                    View Filter
                  </Button>
                </Group>
              </Card>
            );
          })}
        </Stack>
      </Spoiler>
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
          setValue('subdatasets', null as any);
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
    if (!target) return null;
    return (
      <TableUniqueValueSelectField
        {...commonProps}
        column={target as string}
        projectId={project.id}
      />
    );
  }
  if (mode === MultinomialRegressionDependentVariableMode.Subdatasets) {
    if (!subdatasets) return null;
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
      Bottom={
        <>
          <MultinomialLogisticRegressionFormReferenceDependentField />
          <RegressionPenaltyField />
        </>
      }
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
      Bottom={<RegressionPenaltyField />}
    />
  );
}
