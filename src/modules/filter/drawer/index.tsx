import { TableFilterModel } from '@/api/table';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import ConfirmationDialog from '@/components/widgets/confirmation';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
  useDisclosureTrigger,
} from '@/hooks/disclosure';
import { Button, Drawer, Group } from '@mantine/core';
import { Faders, Warning, X } from '@phosphor-icons/react';
import React from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { tableFilterFormSchema, TableFilterFormType } from './form-type';
import SubmitButton from '@/components/standard/button/submit';
import TableFilterComponent from './components';
import FormWrapper from '@/components/utility/form/wrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProjectContext } from '@/modules/project/context';
import { ErrorAlert } from '@/components/standard/fields/watcher';
import { showNotification } from '@mantine/notifications';
import { useCheckFilterValidity } from '../management/hooks';
import TableFilterManagementModal from '../management';

function useValidateFilter() {
  const checkFilter = useCheckFilterValidity();
  return React.useCallback(async (formValues: TableFilterFormType) => {
    const payload = tableFilterFormSchema.cast(formValues, {
      stripUnknown: true,
    }) as TableFilterModel;

    const filter = await checkFilter(payload);
    return filter;
  }, []);
}
interface TableFilterDrawerProps {
  filter: TableFilterModel | null;
  setFilter: React.Dispatch<React.SetStateAction<TableFilterModel | null>>;
}

const defaultTableFilterFormValues: TableFilterFormType = {
  type: TableFilterTypeEnum.And,
  operands: [],
};

interface TableFilterDrawerComponentProps {
  setFilter: React.Dispatch<React.SetStateAction<TableFilterModel | null>>;
  close(): void;
}

function TableFilterDrawerComponent(props: TableFilterDrawerComponentProps) {
  const confirmResetRemote = React.useRef<DisclosureTrigger | null>(null);
  const filterManagerRemote =
    React.useRef<ParametrizedDisclosureTrigger<TableFilterModel> | null>(null);
  const { reset, getValues } = useFormContext<TableFilterFormType>();
  const { setFilter, close } = props;

  return (
    <>
      <TableFilterManagementModal
        ref={filterManagerRemote}
        setFilter={(filter) => {
          reset(filter as TableFilterFormType);
        }}
      />
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
          <Button
            color="red"
            leftSection={<Faders />}
            onClick={() => {
              filterManagerRemote.current?.open(
                getValues() as TableFilterModel,
              );
            }}
          >
            Manage Filters
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
      <TableFilterComponent name="" />
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

  const project = React.useContext(ProjectContext);
  const checkFilter = useValidateFilter();
  const onSubmit = React.useCallback(
    async (formValues: TableFilterFormType) => {
      if (!project) return;
      const filter = await checkFilter(formValues);
      setAppliedFilter(filter);
      close();
      showNotification({
        message: 'Filter has been applied successfully',
        color: 'green',
      });
    },
    [checkFilter, close, project, setAppliedFilter],
  );

  if (!project) {
    return null;
  }

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
          close={close}
          setFilter={setAppliedFilter}
        />
      </FormWrapper>
    </Drawer>
  );
});

export default TableFilterDrawer;
