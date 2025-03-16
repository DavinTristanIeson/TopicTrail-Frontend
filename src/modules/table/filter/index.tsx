import { TableFilterModel } from '@/api/table';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Button, Drawer, Group, Paper } from '@mantine/core';
import { Warning, X } from '@phosphor-icons/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { TableFilterFormType } from './form-type';
import SubmitButton from '@/components/standard/button/submit';
import TableFilterComponent from './components';

interface TableFilterDrawerProps {
  filter: TableFilterModel | null;
  setFilter: React.Dispatch<React.SetStateAction<TableFilterModel | null>>;
}

const defaultTableFilterFormValues: TableFilterFormType = {
  type: TableFilterTypeEnum.And,
  operands: [],
};
const TableFilterDrawer = React.forwardRef<
  DisclosureTrigger | null,
  TableFilterDrawerProps
>(function TableFilterDrawer(props, ref) {
  const { filter: appliedFilter, setFilter: setAppliedFilter } = props;
  const [opened, { close }] = useDisclosureTrigger(ref);

  const form = useForm({
    mode: 'onChange',
    defaultValues:
      (appliedFilter as TableFilterFormType | undefined) ??
      defaultTableFilterFormValues,
  });
  const { reset } = form;
  // Sync applied filter with local filter
  React.useEffect(() => {
    reset();
  }, [appliedFilter, opened]);

  const confirmResetRemote = React.useRef<DisclosureTrigger | null>(null);

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
          close();
        }}
      />
      <Drawer
        opened={opened}
        onClose={close}
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
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
      </Drawer>
    </>
  );
});

export default TableFilterDrawer;
