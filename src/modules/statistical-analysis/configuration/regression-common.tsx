import { filterProjectColumnsByType, SchemaColumnModel } from '@/api/project';
import {
  RegressionInterpretation,
  SchemaColumnTypeEnum,
} from '@/common/constants/enum';
import { yupNullableString } from '@/common/utils/form';
import RHFField from '@/components/standard/fields';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { ComparisonSubdatasetSelectField } from '@/modules/comparison/subdatasets/select-subdataset';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { Stack, Alert, Switch } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import * as Yup from 'yup';

export const regressionInputSchema = Yup.object({
  target: Yup.string().required(),
  interpretation: Yup.string()
    .oneOf(Object.values(RegressionInterpretation))
    .required(),
  constrain_by_groups: Yup.boolean().required(),
  reference: yupNullableString,
});

export type RegressionConfigType = Yup.InferType<typeof regressionInputSchema>;

export const REGRESSION_INTERPRETATION_DICTIONARY = {
  [RegressionInterpretation.GrandMeanDeviation]: {
    label: 'Deviation from Grand Mean',
    value: RegressionInterpretation.GrandMeanDeviation,
    description:
      'Each coefficient represents how much the presence of an independent variable causes a deviation in the grand mean. The intercept represents the grand mean itself.',
  },
  [RegressionInterpretation.RelativeToBaseline]: {
    label: 'Relative to Baseline',
    value: RegressionInterpretation.RelativeToBaseline,
    description:
      'The baseline is defined as the rows where all independent variables have 0 as their value (the rows that are not included in any subdatasets). Each coefficient represents how much the presence of an independent variable causes a deviation in the data compared to the baseline, while the intercept represents the mean of the baseline.',
  },
  [RegressionInterpretation.RelativeToReference]: {
    label: 'Relative to Reference',
    value: RegressionInterpretation.RelativeToReference,
    description:
      'One of the independent variable (subdataset) is chosen as the reference. Each coefficient represents how much the presence of an independent variable causes a deviation in the data compared to the reference, while the intercept represents the mean of the reference.',
  },
};

function ConstrainByGroupsCheckbox() {
  const { control } = useFormContext<RegressionConfigType>();
  const interpretation = useWatch({
    name: 'interpretation',
    control,
  });
  if (
    !interpretation ||
    interpretation === RegressionInterpretation.RelativeToBaseline
  ) {
    return null;
  }
  return (
    <RHFField
      type="switch"
      name="constrain_by_groups"
      label="Constrain by subdatasets?"
      description="If this option is checked, regression will be performed using the rows that are included in the subdatasets. This may be useful if rows not included in the subdatasets are considered as noise."
    />
  );
}

function ReferenceSelectInput() {
  const { control } = useFormContext<RegressionConfigType>();
  const interpretation = useWatch({
    name: 'interpretation',
    control,
  });
  if (
    !interpretation ||
    interpretation !== RegressionInterpretation.RelativeToReference
  ) {
    return null;
  }
  return (
    <ComparisonSubdatasetSelectField
      name="reference"
      label="Reference Independent Variable"
      description="The independent variable (subdataset) that is chosen as the reference for the regression."
      withWholeDataset={false}
    />
  );
}

function RegressionInterpretationSelectInput() {
  const renderOption = useDescriptionBasedRenderOption(
    REGRESSION_INTERPRETATION_DICTIONARY,
  );
  const { setValue } = useFormContext<RegressionConfigType>();

  return (
    <RHFField
      type="select"
      name="interpretation"
      label="Regression Interpretation"
      description="How should the coefficients and intercept of the regression be interpreted?"
      data={Object.values(REGRESSION_INTERPRETATION_DICTIONARY)}
      renderOption={renderOption}
      required
      onChange={() => {
        setValue('constrain_by_groups', false);
        setValue('reference', null as any);
      }}
    />
  );
}

interface DependentVariableSelectFieldProps {
  onChange?(column: SchemaColumnModel | null): void;
  supportedTypes: SchemaColumnTypeEnum[];
}

export function DependentVariableSelectField(
  props: DependentVariableSelectFieldProps,
) {
  const { onChange, supportedTypes } = props;
  const project = React.useContext(ProjectContext);
  const columns = filterProjectColumnsByType(project, supportedTypes);

  return (
    <ProjectColumnSelectField
      label="Dependent Variable"
      name="target"
      data={columns}
      placeholder="Choose the column that will be used as the dependent variable for the regression."
      onChange={onChange}
    />
  );
}

interface CommonRegressionConfigFormProps {
  Bottom?: React.ReactNode;
  Top?: React.ReactNode;
}

export function CommonRegressionConfigForm(
  props: CommonRegressionConfigFormProps,
) {
  const { Top, Bottom } = props;
  return (
    <Stack>
      <Alert color="blue" icon={<Info />}>
        Each subdataset will be treated as an independent binary variable to
        predict the values of a column as the dependent variable. The
        coefficients of each subdataset represents the effect of the independent
        variables on the dependent variable.
      </Alert>
      {Top}
      <RegressionInterpretationSelectInput />
      <ConstrainByGroupsCheckbox />
      <ReferenceSelectInput />
      {Bottom}
    </Stack>
  );
}

export function RegressionPenaltyField() {
  const penalty = useWatch({
    name: 'penalty',
  }) as number | undefined;
  const { setValue } = useFormContext();
  const checked = penalty != null;
  return (
    <Stack>
      <Switch
        label="Apply regularization?"
        description="Logistic regression models can suffer from complete or quasi-complete separation, where the coefficients of the model gets artificially inflated due to a combination of independent variables perfectly (or near-perfectly) isolating a specific level of the dependent variable. We recommend either merging/excluding the problematic level, or applying regularization. Keep in mind that the coefficients of regularized models are shrunken, so they may underestimate the effects of the independent variable on the dependent variable."
        checked={checked}
        onChange={(e) => {
          if (e.target.checked) {
            setValue('penalty', 0.0001);
          } else {
            setValue('penalty', null);
          }
        }}
      />
      {checked && (
        <RHFField
          type="number"
          name="penalty"
          label="Penalty"
          required
          description="The magnitude of the penalty term in the Lasso regularization applied to the model. Consider testing out smaller values like 1e-5, 1e-4, 1e-3, and so on first until the model reaches convergence, to avoid shrinking the coefficients too extremely."
        />
      )}
    </Stack>
  );
}
