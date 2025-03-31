// Needs to be separated due to Gridstack import causing issues
import { Paper, Text } from '@mantine/core';
import React from 'react';
import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';

interface ReorderCategoryOrderDndContextProps {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ReorderCategoryOrderDndContext(
  props: ReorderCategoryOrderDndContextProps,
) {
  const { categories, setCategories } = props;

  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: categories,
    options: SortableGridStackDefaultOptions({
      itemsCount: categories.length,
    }),
  });
  useSortableGridStack({
    grid,
    onSort: setCategories,
  });

  return (
    <div id={id} className="grid-stack">
      {categories.map((category, index) => (
        <div
          className="grid-stack-item"
          key={category}
          ref={gridElements.current![category]}
        >
          <Paper
            className="p-3 select-none grid-stack-item-content flex items-center flex-row"
            style={{ display: 'flex' }}
          >
            <div className="rounded bg-primary">{index + 1}</div>
            <Text ta="center" className="flex-1">
              {category}
            </Text>
            <div></div>
          </Paper>
        </div>
      ))}
    </div>
  );
}
