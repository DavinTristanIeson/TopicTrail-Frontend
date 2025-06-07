import { TableFilterModel } from '@/api/table';
import RHFField from '@/components/standard/fields';
import { ErrorAlert } from '@/components/standard/fields/watcher';
import FormWrapper from '@/components/utility/form/wrapper';
import { TableFilterDrawerFormBody } from '@/modules/filter/drawer';
import {
  defaultTableFilterFormValues,
  tableFilterFormSchema,
  TableFilterFormType,
} from '@/modules/filter/drawer/form-type';
import { useCheckFilterValidity } from '@/modules/filter/management/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Drawer, Group, Indicator, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useForm, useFormContext, useFormState } from 'react-hook-form';
import * as Yup from 'yup';
import {
  CommonRegressionConfigForm,
  regressionInputSchema,
} from './regression-common';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { PencilSimple } from '@phosphor-icons/react';
import { get } from 'lodash-es';
import { getAnyError } from '@/common/utils/error';

interface LogisticRegressionFilterDrawerContents {
  onClose(): void;
}

export const logisticRegressionInputSchema = regressionInputSchema.shape({
  filter: tableFilterFormSchema.default(defaultTableFilterFormValues),
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

  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(tableFilterFormSchema),
    defaultValues: React.useMemo(() => {
      return getGlobalValues('filter') ?? defaultTableFilterFormValues;
    }, [getGlobalValues]),
  });

  const checkFilter = useCheckFilterValidity();

  const onApplyFilter = React.useCallback(
    (payload: TableFilterModel) => {
      setGlobalValue('filter', payload as TableFilterFormType);
      onClose();
      clearGlobalErrors('filter');
    },
    [clearGlobalErrors, onClose, setGlobalValue],
  );

  const onSubmit = React.useCallback(
    async (formValues: TableFilterFormType) => {
      let payload = tableFilterFormSchema.cast(formValues, {
        stripUnknown: true,
      }) as TableFilterModel;
      payload = await checkFilter(payload);
      onApplyFilter(payload);

      showNotification({
        message: 'The dependent variable has been updated successfully',
        color: 'green',
      });
    },
    [checkFilter, onApplyFilter],
  );

  const loadFilter = React.useCallback(
    (filter: TableFilterModel | null) => {
      if (!filter) return;
      onApplyFilter(filter);
    },
    [onApplyFilter],
  );

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <ErrorAlert />
      <TableFilterDrawerFormBody
        name=""
        close={onClose}
        setFilter={loadFilter}
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
  const remote = React.useRef<DisclosureTrigger | null>(null);
  const { errors } = useFormState({
    name: 'target',
  });
  const filterErrorMessage = getAnyError(get(errors, 'filter'))?.message;

  const tooltipButton = (
    <Tooltip
      label="There are errors in your filter. Please fix them first."
      disabled={!filterErrorMessage}
      color="red"
    >
      <Indicator disabled={!filterErrorMessage} color="red">
        <Button
          leftSection={<PencilSimple />}
          onClick={() => remote.current?.open()}
        >
          Edit
        </Button>
      </Indicator>
    </Tooltip>
  );

  return (
    <>
      <RHFField
        type="text"
        label="Dependent Variable"
        name="target"
        required
        error={filterErrorMessage}
        description="Create a filter on the dataset as the dependent variable to be predicted. The dependent variable is a series of boolean values that indicates whether a row is included in the filter or not."
        inputContainer={(children) => (
          <Group align="flex-start">
            <div className="flex-1">{children}</div>
            {tooltipButton}
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
