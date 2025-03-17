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
import { isEqual, uniqBy } from 'lodash';
import React from 'react';

export interface TableColumnState {
  name: string;
  visible: boolean;
}

interface TableColumnStatesSortableContextProps {
  columnStates: TableColumnState[];
  setColumnStates: React.Dispatch<React.SetStateAction<TableColumnState[]>>;
}
function TableColumnStatesSortableContext(
  props: TableColumnStatesSortableContextProps,
) {
  const { columnStates: columnStates, setColumnStates: setColumnStates } =
    props;
  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: columnStates.map((column) => column.name),
    options: {
      column: 1,
      margin: 4,
      maxRow: columnStates.length,
      cellHeight: 80,
      disableResize: true,
      removable: false,
      alwaysShowResizeHandle: false,
      float: true,
    },
  });

  const onSort = React.useCallback((ids: string[]) => {
    setColumnStates((prev) => {
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
      {columnStates.map((columnState, index) => {
        const visible = columnState.visible;
        return (
          <div
            className="grid-stack-item"
            key={columnState.name}
            ref={gridElements.current![columnState.name]}
          >
            <Paper
              className="p-3 select-none grid-stack-item-content flex items-center flex-row"
              style={{ display: 'flex' }}
            >
              <div className="rounded bg-primary">{index + 1}</div>
              <Text ta="center" className="flex-1">
                {columnState.name}
              </Text>
              <ActionIcon
                variant="subtle"
                size={32}
                color={visible ? 'green' : 'gray'}
                onClick={(e) => {
                  setColumnStates((columnState) => {
                    if (!columnState[index]) return columnState;
                    const next = columnState.slice();
                    next[index] = {
                      ...next[index]!,
                      visible: !visible,
                    };
                    return next;
                  });
                }}
              >
                {visible ? <Eye size={24} /> : <EyeSlash size={24} />}
              </ActionIcon>
            </Paper>
          </div>
        );
      })}
    </div>
  );
}

interface TableColumnStatesDrawerProps {
  columnStates: TableColumnState[] | null;
  setColumnStates: React.Dispatch<
    React.SetStateAction<TableColumnState[] | null>
  >;
  columns: SchemaColumnModel[];
}
const TableColumnStatesDrawer = React.forwardRef<
  DisclosureTrigger | null,
  TableColumnStatesDrawerProps
>(function TableColumnStatesDrawer(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  const {
    columnStates: appliedColumnStates,
    setColumnStates: setAppliedColumnStates,
    columns,
  } = props;
  const [columnStates, setColumnStates] = React.useState<TableColumnState[]>(
    [],
  );
  const defaultColumnStates = React.useMemo(() => {
    return columns.map<TableColumnState>((column) => {
      return {
        name: column.name,
        visible: true,
      };
    });
  }, [columns]);

  React.useEffect(() => {
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
    setColumnStates(resolvedColumnStates);
  }, [columns, appliedColumnStates, opened]);

  return (
    <Drawer
      title="Column States"
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
            leftSection={<Warning />}
            onClick={() => {
              setAppliedColumnStates(null);
              close();
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
              if (isEqual(columnStates, defaultColumnStates)) {
                setAppliedColumnStates(null);
              } else {
                setAppliedColumnStates(columnStates);
              }
              close();
            }}
          >
            Apply
          </Button>
        </Group>
      </Drawer.Header>
      <Alert color="blue" icon={<Info size={20} />}>
        You can move columns that are closely related so that they're next to
        each other, or even hide columns that are not necessary for the needs of
        your analysis to lessen the mental burden.
      </Alert>
      <TableColumnStatesSortableContext
        columnStates={columnStates}
        setColumnStates={setColumnStates}
      />
    </Drawer>
  );
});

export default TableColumnStatesDrawer;
