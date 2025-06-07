import { ComparisonStateItemModel } from '@/api/comparison';
import { TableFilterModel } from '@/api/table';
import { RegressionInterpretation } from '@/common/constants/enum';
import { yupNullableString } from '@/common/utils/form';
import RHFField from '@/components/standard/fields';
import { ErrorAlert } from '@/components/standard/fields/watcher';
import FormWrapper from '@/components/utility/form/wrapper';
import {
  ComparisonFilterFormType,
  comparisonFilterFormSchema,
} from '@/modules/comparison/subdatasets/form-type';
import { TableFilterDrawerFormBody } from '@/modules/filter/drawer';
import {
  defaultTableFilterFormValues,
  TableFilterFormType,
} from '@/modules/filter/drawer/form-type';
import { useCheckFilterValidity } from '@/modules/filter/management/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Drawer,
  Group,
  Indicator,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import {
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import * as Yup from 'yup';
import { CommonRegressionConfigForm } from './regression-common';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { PencilSimple } from '@phosphor-icons/react';
import { get } from 'lodash-es';
import { getAnyError } from '@/common/utils/error';

interface LogisticRegressionFilterDrawerContents {
  onClose(): void;
}

const defaultLogisticRegressionFilterValues: ComparisonFilterFormType = {
  name: `Dependent Variable`,
  filter: defaultTableFilterFormValues,
};

export const logisticRegressionInputSchema = Yup.object({
  target: comparisonFilterFormSchema
    .required()
    .default(defaultLogisticRegressionFilterValues),
  interpretation: Yup.string()
    .oneOf(Object.values(RegressionInterpretation))
    .required(),
  constrain_by_groups: Yup.boolean().required(),
  reference: yupNullableString,
});
export type LogisticRegressionConfigType = Yup.InferType<
  typeof logisticRegressionInputSchema
>;

function LogisticRegressionFilterDrawerContents(
  props: LogisticRegressionFilterDrawerContents,
) {
  const { onClose } = props;
  const {
    getValues: getGlobalValues,
    setValue: setGlobalValue,
    clearErrors: clearGlobalErrors,
  } = useFormContext<LogisticRegressionConfigType>();

  const defaultValues = React.useMemo(() => {
    return (
      (getGlobalValues('target') as ComparisonFilterFormType | undefined) ??
      defaultLogisticRegressionFilterValues
    );
  }, [getGlobalValues]);

  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(comparisonFilterFormSchema),
    defaultValues,
  });
  const { getValues: getLocalValues, reset: resetLocal } = form;

  const checkFilter = useCheckFilterValidity();

  const onSubmit = React.useCallback(
    async (formValues: ComparisonFilterFormType) => {
      const payload = comparisonFilterFormSchema.cast(formValues, {
        stripUnknown: true,
      }) as ComparisonStateItemModel;
      payload.filter = await checkFilter(payload.filter);
      setGlobalValue('target', payload as any);
      onClose();
      clearGlobalErrors();
      showNotification({
        message: 'The dependent variable has been updated successfully',
        color: 'green',
      });
    },
    [checkFilter, clearGlobalErrors, onClose, setGlobalValue],
  );

  const loadFilter = React.useCallback(
    (filter: TableFilterModel | null) => {
      resetLocal({
        name: getLocalValues('name'),
        filter: filter as TableFilterFormType,
      });
    },
    [getLocalValues, resetLocal],
  );

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <ErrorAlert />
      <TableFilterDrawerFormBody
        name="filter"
        close={onClose}
        setFilter={loadFilter}
        AboveForm={
          <div className="pb-3">
            <RHFField
              type="text"
              name="name"
              label="Dependent Variable"
              required
              description="The name of the dependent variable that will be used as the prediction target in the regression."
            />
          </div>
        }
      />
    </FormWrapper>
  );
}

const LogisticRegressionNamedTableFilterDrawer = React.forwardRef<
  DisclosureTrigger | null,
  object
>(function LogisticRegressionNamedTableFilterDrawer(props, ref) {
  const [opened, { close: onClose }] = useDisclosureTrigger(ref);
  return (
    <Drawer
      title="Edit Dependent Variable"
      onClose={onClose}
      opened={opened}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      {opened && <LogisticRegressionFilterDrawerContents onClose={onClose} />}
    </Drawer>
  );
});

function LogisticRegressionDependentVariableField() {
  const { control } = useFormContext<LogisticRegressionConfigType>();
  const target = useWatch({
    control,
    name: 'target',
  });
  const remote = React.useRef<DisclosureTrigger | null>(null);
  const { errors } = useFormState({
    name: 'target',
  });
  const targetErrors = get(errors, 'target');
  const actualErrorMessage = getAnyError(targetErrors)?.message;

  return (
    <>
      <TextInput
        label="Dependent Variable"
        value={target?.name}
        required
        description="Create a filter on the dataset as the dependent variable to be predicted. The dependent variable is a series of boolean values that indicates whether a row is included in the filter or not."
        error={actualErrorMessage}
        readOnly
        inputContainer={(children) => (
          <Group align="flex-start">
            <div className="flex-1">{children}</div>
            <Tooltip
              label="There are errors in your filter. Please fix them first."
              disabled={!targetErrors}
              color="red"
            >
              <Indicator disabled={!targetErrors} color="red">
                <Button
                  leftSection={<PencilSimple />}
                  onClick={() => remote.current?.open()}
                >
                  Edit
                </Button>
              </Indicator>
            </Tooltip>
          </Group>
        )}
      />
      <LogisticRegressionNamedTableFilterDrawer ref={remote} />
    </>
  );
}

export function LogisticRegressionConfigForm() {
  return (
    <CommonRegressionConfigForm
      Top={<LogisticRegressionDependentVariableField />}
    />
  );
}
