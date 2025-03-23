import { SchemaColumnModel } from '@/api/project';
import { ListSkeleton } from '@/components/visual/loading';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Alert, Button, Drawer, Group } from '@mantine/core';
import { ArrowsLeftRight, Info, Warning, X } from '@phosphor-icons/react';
import { isEqual, uniqBy } from 'lodash';
import dynamic from 'next/dynamic';
import React from 'react';

const TableColumnStatesSortableContext = dynamic(
  () => import('./sortable-column-states-context'),
  {
    ssr: false,
    loading() {
      return <ListSkeleton />;
    },
  },
);
export interface TableColumnState {
  name: string;
  visible: boolean;
}

interface TableColumnStatesDrawerProps {
  columnStates: TableColumnState[] | null;
  setColumnStates: React.Dispatch<
    React.SetStateAction<TableColumnState[] | null>
  >;
  columns: SchemaColumnModel[];
}

interface TableColumnStatesDrawerStateManagerProps
  extends TableColumnStatesDrawerProps {
  onClose(): void;
}

function TableColumnStatesDrawerStateManager(
  props: TableColumnStatesDrawerStateManagerProps,
) {
  const {
    columnStates: appliedColumnStates,
    setColumnStates: setAppliedColumnStates,
    columns,
    onClose,
  } = props;

  const defaultColumnStates = React.useMemo(() => {
    return columns.map<TableColumnState>((column) => {
      return {
        name: column.name,
        visible: true,
      };
    });
  }, [columns]);
  const [columnStates, setColumnStates] = React.useState<TableColumnState[]>(
    () => {
      const combinedColumnStates = (appliedColumnStates ?? []).concat(
        defaultColumnStates ?? [],
      );
      const uniqueColumnStates = uniqBy(combinedColumnStates, (x) => x.name);
      const resolvedColumnStates = uniqueColumnStates.filter((column) => {
        const isPartOfColumns = !!defaultColumnStates.find(
          (col) => col.name === column.name,
        );
        return isPartOfColumns;
      });
      return resolvedColumnStates;
    },
  );

  return (
    <>
      <Drawer.Header>
        <Group className="py-3 w-full">
          <Button
            color="red"
            leftSection={<Warning />}
            onClick={() => {
              setAppliedColumnStates(null);
              onClose();
            }}
          >
            Reset
          </Button>
          <div className="flex-1" />
          <Button
            leftSection={<X />}
            color="red"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            leftSection={<ArrowsLeftRight />}
            onClick={() => {
              if (isEqual(columnStates, defaultColumnStates)) {
                setAppliedColumnStates(null);
              } else {
                setAppliedColumnStates(columnStates);
              }
              onClose();
            }}
          >
            Apply
          </Button>
        </Group>
      </Drawer.Header>
      <Alert color="blue" icon={<Info size={20} />}>
        You can move columns that are closely related so that they&apos;re next
        to each other, or even hide columns that are not necessary for the needs
        of your analysis to lessen the mental burden.
      </Alert>
      <TableColumnStatesSortableContext
        columnStates={columnStates}
        setColumnStates={setColumnStates}
      />
    </>
  );
}

const TableColumnStatesDrawer = React.forwardRef<
  DisclosureTrigger | null,
  TableColumnStatesDrawerProps
>(function TableColumnStatesDrawer(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);

  return (
    <Drawer
      title="Column States"
      opened={opened}
      onClose={close}
      position="right"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      {opened && (
        <TableColumnStatesDrawerStateManager {...props} onClose={close} />
      )}
    </Drawer>
  );
});

export default TableColumnStatesDrawer;
