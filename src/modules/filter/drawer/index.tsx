import { TableFilterModel } from '@/api/table';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Button, Drawer, Group } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import React from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
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
import { useFilterDataManager } from '@/modules/userdata/data-manager';
import { useDebouncedValue } from '@mantine/hooks';
import UserDataManager from '@/modules/userdata';
import { CancelButton } from '@/components/standard/button/variants';
import { FormEditableContext } from '@/components/standard/fields/context';
import { DefaultErrorViewBoundary } from '@/components/visual/error';

interface TableFilterUserDataManagerProps {
  setFilter: React.Dispatch<TableFilterModel | null>;
}

function TableFilterUserDataManager(props: TableFilterUserDataManagerProps) {
  const values = useWatch<TableFilterFormType>();
  const [debouncedFormValues] = useDebouncedValue(values, 800, {
    leading: false,
  });
  const validatedValues = React.useMemo(() => {
    try {
      return tableFilterFormSchema.validateSync(debouncedFormValues, {
        stripUnknown: true,
      }) as TableFilterFormType;
    } catch {
      return null;
    }
  }, [debouncedFormValues]);

  const rendererProps = useFilterDataManager({
    state: validatedValues as TableFilterModel | null,
    onApply: props.setFilter,
  });
  return <UserDataManager {...rendererProps} label="Filter" />;
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
  canReset?: boolean;
}

export function TableFilterDrawerFormBody(
  props: TableFilterDrawerComponentProps,
) {
  const confirmResetRemote = React.useRef<DisclosureTrigger | null>(null);
  const {
    reset,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();
  const { setFilter, close, AboveForm, name, canReset } = props;
  const { editable } = React.useContext(FormEditableContext);

  return (
    <DefaultErrorViewBoundary>
      <ConfirmationDialog
        ref={confirmResetRemote}
        title="Reset Filter"
        message="Are you sure you want to reset the filters? All of your filters will be removed!"
        dangerous
        positiveAction="Reset"
        onConfirm={async () => {
          if (name) {
            setValue(name, defaultTableFilterFormValues);
          } else {
            reset(defaultTableFilterFormValues);
          }
          setFilter(null);
          close();
        }}
      />
      <Drawer.Header>
        {editable && (
          <Group className="py-3 w-full">
            {canReset && (
              <Button
                color="red"
                leftSection={<Warning />}
                onClick={() => {
                  confirmResetRemote.current?.open();
                }}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            )}
            <div className="flex-1" />
            <CancelButton onClick={close} />
            <SubmitButton>Apply</SubmitButton>
          </Group>
        )}
      </Drawer.Header>
      {AboveForm}
      {editable && <TableFilterUserDataManager setFilter={setFilter} />}
      <TableFilterComponent name={name} />
    </DefaultErrorViewBoundary>
  );
}

interface TableFilterDrawerFormProps extends TableFilterDrawerProps {
  onClose(): void;
}

function TableFilterDrawerForm(props: TableFilterDrawerFormProps) {
  const { filter: appliedFilter, setFilter: setAppliedFilter, onClose } = props;
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

  const checkFilter = useCheckFilterValidity();
  const onSubmit = React.useCallback(
    async (formValues: TableFilterFormType) => {
      const payload = tableFilterFormSchema.cast(formValues, {
        stripUnknown: true,
      }) as TableFilterModel;
      const filter = await checkFilter(payload);
      setAppliedFilter(filter);
      onClose();
      showNotification({
        message: 'Filter has been applied successfully',
        color: 'green',
      });
    },
    [checkFilter, onClose, setAppliedFilter],
  );

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <ErrorAlert />
      <TableFilterDrawerFormBody
        name=""
        close={onClose}
        setFilter={(filter) => {
          setAppliedFilter(filter);
          onClose();
        }}
        canReset
      />
    </FormWrapper>
  );
}

const TableFilterDrawer = React.forwardRef<
  DisclosureTrigger | null,
  TableFilterDrawerProps
>(function TableFilterDrawer(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);

  return (
    <Drawer
      title="Filter"
      opened={opened}
      onClose={close}
      closeOnClickOutside={false}
      closeOnEscape={false}
      size="xl"
    >
      <DefaultErrorViewBoundary>
        {opened && <TableFilterDrawerForm {...props} onClose={close} />}
      </DefaultErrorViewBoundary>
    </Drawer>
  );
});

export default TableFilterDrawer;
