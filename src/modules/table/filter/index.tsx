import { TableFilterModel } from '@/api/table';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Button, Drawer, Group } from '@mantine/core';
import { Warning, X } from '@phosphor-icons/react';
import React from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { tableFilterFormSchema, TableFilterFormType } from './form-type';
import SubmitButton from '@/components/standard/button/submit';
import TableFilterComponent from './components';
import FormWrapper from '@/components/utility/form/wrapper';
import { client } from '@/common/api/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProjectContext } from '@/modules/project/context';
import { ErrorAlert } from '@/components/standard/fields/watcher';
import { showNotification } from '@mantine/notifications';

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
  const { reset } = useFormContext<TableFilterFormType>();
  const { setFilter, close } = props;

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

  const { mutateAsync: checkFilter } = client.useMutation(
    'post',
    '/table/{project_id}/check-filter',
  );
  const project = React.useContext(ProjectContext);
  const onSubmit = React.useCallback(
    async (formValues: TableFilterFormType) => {
      if (!project) return;
      const payload = tableFilterFormSchema.cast(formValues, {
        stripUnknown: true,
      }) as TableFilterFormType;
      const res = await checkFilter({
        body: payload as TableFilterModel,
        params: {
          path: {
            project_id: project.id,
          },
        },
      });
      setAppliedFilter(res.data);
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
