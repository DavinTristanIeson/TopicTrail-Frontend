import { SchemaColumnModel } from '@/api/project';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import {
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import {
  ActionIcon,
  Alert,
  Button,
  Drawer,
  Group,
  Paper,
  Text,
} from '@mantine/core';
import {
  ArrowsLeftRight,
  Eye,
  EyeSlash,
  Info,
  Warning,
  X,
} from '@phosphor-icons/react';
import React from 'react';

export interface TableColumnOrderState {
  name: string;
  visible: boolean;
}

interface TableColumnsOrderSortableContextProps {
  columnOrders: TableColumnOrderState[];
  setColumnOrders: React.Dispatch<
    React.SetStateAction<TableColumnOrderState[]>
  >;
}
function TableColumnsOrderSortableContext(
  props: TableColumnsOrderSortableContextProps,
) {
  const { columnOrders, setColumnOrders } = props;
  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: columnOrders.map((column) => column.name),
    options: {
      column: 1,
      margin: 4,
      maxRow: columnOrders.length,
      cellHeight: 80,
      disableResize: true,
      removable: false,
      alwaysShowResizeHandle: false,
      float: true,
    },
  });

  const onSort = React.useCallback((ids: string[]) => {
    setColumnOrders((prev) => {
      const next: typeof prev = [];
      for (const id of ids) {
        const associatedColumnState = prev.find((col) => col.name === id);
        if (!associatedColumnState) continue;
        next.push(associatedColumnState);
      }
      return next;
    });
  }, []);
  useSortableGridStack({
    grid,
    onSort,
  });

  return (
    <div id={id} className="grid-stack">
      {columnOrders.map((columnOrder, index) => (
        <div
          className="grid-stack-item"
          key={columnOrder.name}
          ref={gridElements.current![columnOrder.name]}
        >
          <Paper
            className="p-3 select-none grid-stack-item-content flex items-center flex-row"
            style={{ display: 'flex' }}
          >
            <div className="rounded bg-primary">{index + 1}</div>
            <Text ta="center" className="flex-1">
              {columnOrder.name}
            </Text>
            <ActionIcon
              variant="subtle"
              onClick={() => {
                setColumnOrders((columnOrder) => {
                  if (!columnOrder[index]) return columnOrder;
                  const next = columnOrder.slice();
                  next[index]!.visible = !next[index]!.visible;
                  return next;
                });
              }}
            >
              {columnOrder.visible ? <Eye size={24} /> : <EyeSlash size={24} />}
            </ActionIcon>
          </Paper>
        </div>
      ))}
    </div>
  );
}

interface TableColumnsOrderDrawerProps {
  columnOrders: TableColumnOrderState[] | null;
  setColumnOrders: React.Dispatch<
    React.SetStateAction<TableColumnOrderState[] | null>
  >;
  columns: SchemaColumnModel[];
}
const TableColumnsOrderDrawer = React.forwardRef<
  DisclosureTrigger | null,
  TableColumnsOrderDrawerProps
>(function TableColumnsSortDrawer(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  const {
    columnOrders: appliedColumnOrders,
    setColumnOrders: setAppliedColumnOrders,
    columns,
  } = props;
  const [columnOrders, setColumnOrders] = React.useState<
    TableColumnOrderState[]
  >([]);
  const defaultColumnOrders = React.useMemo(() => {
    return columns.map<TableColumnOrderState>((column) => {
      return {
        name: column.name,
        visible: true,
      };
    });
  }, [columns]);

  React.useEffect(() => {
    const resolvedColumnOrders = defaultColumnOrders
      .concat(appliedColumnOrders ?? [])
      .filter((column) => {
        const isPartOfColumns = !!defaultColumnOrders.find(
          (col) => col.name === column.name,
        );
        return isPartOfColumns;
      });
    setColumnOrders(resolvedColumnOrders);
  }, [columns, appliedColumnOrders, opened]);

  return (
    <Drawer
      title="Sort Columns"
      opened={opened}
      onClose={close}
      position="right"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Drawer.Header>
        <Group className="py-3 w-full">
          <Button
            color="red"
            variant="outline"
            leftSection={<Warning />}
            onClick={() => {
              setColumnOrders(defaultColumnOrders);
            }}
          >
            Reset
          </Button>
          <div className="flex-1" />
          <Button
            leftSection={<X />}
            color="red"
            variant="outline"
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            leftSection={<ArrowsLeftRight />}
            onClick={() => {
              setAppliedColumnOrders(columnOrders);
            }}
          >
            Apply Changes
          </Button>
        </Group>
      </Drawer.Header>
      <Alert color="blue" icon={<Info size={20} />}>
        You can move columns that are closely related so that they're next to
        each other, or even hide columns that are not necessary for the needs of
        your analysis to lessen the mental burden.
      </Alert>
      <TableColumnsOrderSortableContext
        columnOrders={columnOrders}
        setColumnOrders={setColumnOrders}
      />
    </Drawer>
  );
});

export default TableColumnsOrderDrawer;
