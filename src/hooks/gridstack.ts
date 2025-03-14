import React, { useId } from 'react';
import { useManyRefs } from './ref';
import { GridStack, GridStackOptions } from 'gridstack';

interface UseControlledGridStackProps {
  gridItems: string[];
  options: GridStackOptions;
}

export function useControlledGridstack(props: UseControlledGridStackProps) {
  // From https://gridstackjs.com/demo/react-hooks.html
  const { gridItems, options } = props;
  const id = useId();
  const gridRef = React.useRef<GridStack>();
  const gridElementsRef = useManyRefs<HTMLDivElement>(gridItems);
  React.useEffect(() => {
    if (!gridRef.current) {
      gridRef.current = GridStack.init(options, `#${id}`);
    }
    const grid = gridRef.current;
    grid.batchUpdate();
    grid.removeAll(false);
    for (const itemId of gridItems) {
      const element = gridElementsRef.current[itemId];
      if (!element?.current) continue;
      grid.makeWidget(element.current, {
        id: itemId,
      });
    }
    grid.batchUpdate(false);
  });

  return {
    id,
    grid: gridRef,
    gridElements: gridElementsRef,
  };
}

interface UseSortableGridStackProps {
  grid: React.MutableRefObject<GridStack | undefined>;
  onSort(sortedValues: string[]): void;
}

export function useSortableGridStack(props: UseSortableGridStackProps) {
  const { grid, onSort } = props;
  React.useLayoutEffect(() => {
    if (!grid.current) return;
    const currentGrid = grid.current;
    currentGrid.on('change', (event, items) => {
      const gridItems = currentGrid.getGridItems();
      const parsedGridItems = gridItems.map((item) => {
        return {
          order: parseInt(item.getAttribute('gs-y')!, 10),
          id: item.getAttribute('gs-id')!,
        };
      });

      parsedGridItems.sort((a, b) => a.order - b.order);
      const newIds = parsedGridItems.map((gridItem) => gridItem.id);
      onSort(newIds);
    });
    return () => {
      currentGrid.off('change');
    };
  }, [onSort]);
}
