import { TableFilterModel } from '@/api/table';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Button, Drawer, Group } from '@mantine/core';
import { Warning, X } from '@phosphor-icons/react';
import React from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import {
  defaultTableFilterFormValues,
  tableFilterFormSchema,
  TableFilterFormType,
} from './form-type';
import SubmitButton from '@/components/standard/button/submit';
import TableFilterComponent from './components';
import FormWrapper from '@/components/utility/form/wrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorAlert } from '@/components/standard/fields/watcher';
import { showNotification } from '@mantine/notifications';
import { useCheckFilterValidity } from '../management/hooks';
import TableFilterManagementSection from '../management';

function useValidateFilter() {
  const checkFilter = useCheckFilterValidity();
  return React.useCallback(
    async (formValues: TableFilterFormType) => {
      const payload = tableFilterFormSchema.cast(formValues, {
        stripUnknown: true,
      }) as TableFilterModel;

      const filter = await checkFilter(payload);
      return filter;
    },
    [checkFilter],
  );
}
interface TableFilterDrawerProps {
  filter: TableFilterModel | null;
  setFilter: React.Dispatch<TableFilterModel | null>;
}

interface TableFilterDrawerComponentProps {
  setFilter: React.Dispatch<TableFilterModel | null>;
  close(): void;
  name: string;
  AboveForm?: React.ReactNode;
}

export function TableFilterDrawerComponent(
  props: TableFilterDrawerComponentProps,
) {
  const confirmResetRemote = React.useRef<DisclosureTrigger | null>(null);
  const { reset, getValues } = useFormContext<TableFilterFormType>();
  const { setFilter, close, AboveForm, name } = props;

  const getFilter = React.useCallback(() => {
    return tableFilterFormSchema.cast(getValues(), {
      stripUnknown: true,
    }) as TableFilterModel;
  }, [getValues]);

  return (
    <>
      <ConfirmationDialog
        ref={confirmResetRemote}
        title="Reset Filter"
        message="Are you sure you want to reset the filters? All of your filters will be removed!"
        dangerous
        positiveAction="Reset"
        onConfirm={async () => {
          reset(defaultTableFilterFormValues);
          setFilter(null);
          close();
        }}
      />
      <Drawer.Header>
        <Group className="py-3 w-full">
          <Button
            color="red"
            leftSection={<Warning />}
            onClick={() => {
              confirmResetRemote.current?.open();
            }}
          >
            Reset
          </Button>
          <div className="flex-1" />
          <Button
            onClick={close}
            color="red"
            variant="outline"
            leftSection={<X />}
          >
            Cancel
          </Button>
          <SubmitButton>Apply</SubmitButton>
        </Group>
      </Drawer.Header>
      {AboveForm}
      <TableFilterManagementSection
        getFilter={getFilter}
        setFilter={(filter) => {
          setFilter(filter);
          close();
        }}
      />
      <TableFilterComponent name={name} />
    </>
  );
}

const TableFilterDrawer = React.forwardRef<
  DisclosureTrigger | null,
  TableFilterDrawerProps
>(function TableFilterDrawer(props, ref) {
  const { filter: appliedFilter, setFilter: setAppliedFilter } = props;
  const [opened, { close }] = useDisclosureTrigger(ref);

  const defaultValues = React.useMemo(() => {
    return (
      (appliedFilter as TableFilterFormType | undefined) ??
      defaultTableFilterFormValues
    );
  }, [appliedFilter]);

  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(tableFilterFormSchema),
    defaultValues,
  });
  const { reset } = form;
  // Sync applied filter with local filter
  React.useEffect(() => {
    reset(defaultValues);
  }, [appliedFilter, defaultValues, opened, reset]);

  const checkFilter = useValidateFilter();
  const onSubmit = React.useCallback(
    async (formValues: TableFilterFormType) => {
      const filter = await checkFilter(formValues);
      setAppliedFilter(filter);
      close();
      showNotification({
        message: 'Filter has been applied successfully',
        color: 'green',
      });
    },
    [checkFilter, close, setAppliedFilter],
  );

  return (
    <Drawer
      title="Filter"
      opened={opened}
      onClose={close}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <FormWrapper form={form} onSubmit={onSubmit}>
        <ErrorAlert />
        <TableFilterDrawerComponent
          name=""
          close={close}
          setFilter={setAppliedFilter}
        />
      </FormWrapper>
    </Drawer>
  );
});

export default TableFilterDrawer;
