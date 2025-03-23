import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import { Paper, ActionIcon, Text } from '@mantine/core';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import React from 'react';
import { TableColumnState } from './column-states-drawer';

interface TableColumnStatesSortableContextProps {
  columnStates: TableColumnState[];
  setColumnStates: React.Dispatch<React.SetStateAction<TableColumnState[]>>;
}
export default function TableColumnStatesSortableContext(
  props: TableColumnStatesSortableContextProps,
) {
  const { columnStates: columnStates, setColumnStates: setColumnStates } =
    props;
  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: columnStates.map((column) => column.name),
    options: SortableGridStackDefaultOptions({
      itemsCount: columnStates.length,
    }),
  });

  const onSort = React.useCallback(
    (ids: string[]) => {
      setColumnStates((prev) => {
        const next: typeof prev = [];
        for (const id of ids) {
          const associatedColumnState = prev.find((col) => col.name === id);
          if (!associatedColumnState) continue;
          next.push(associatedColumnState);
        }
        return next;
      });
    },
    [setColumnStates],
  );
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
                onClick={() => {
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
