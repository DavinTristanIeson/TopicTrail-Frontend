import React, { useId } from 'react';
import { useManyRefs } from './ref';
import {
  GridStack,
  type GridStackOptions,
  type GridStackWidget,
} from 'gridstack';

interface UseControlledGridStackProps {
  gridItems: string[];
  options: GridStackOptions;
  makeWidget?(gridItemId: string, element: HTMLDivElement): GridStackWidget;
}

export function useControlledGridstack(props: UseControlledGridStackProps) {
  // From https://gridstackjs.com/demo/react-hooks.html
  const { gridItems, options, makeWidget } = props;
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
      grid.makeWidget(
        element.current,
        makeWidget
          ? makeWidget(itemId, element.current)
          : {
              id: itemId,
            },
      );
    }
    grid.batchUpdate(false);
  });

  return {
    id,
    grid: gridRef,
    gridElements: gridElementsRef,
  };
}

interface UseSortableGridStackProps<T> {
  grid: React.MutableRefObject<GridStack | undefined>;
  setValues: React.Dispatch<React.SetStateAction<T[]>>;
  getId(value: T): string;
}

export function useSortableGridStack<T>(props: UseSortableGridStackProps<T>) {
  const { grid, setValues, getId } = props;
  React.useEffect(() => {
    if (!grid.current) return;
    const currentGrid = grid.current;
    currentGrid.on('change', (e, items) => {
      const newPositionMap = new Map(
        items
          .map((item) => {
            return [item.id!, item.y!] as [string, number];
          })
          .filter((item) => item[0] != null && item[1] != null),
      );

      setValues((values) => {
        if (!values) return values;
        return values
          .map<[T, number]>((value, index) => {
            const id = getId(value);
            if (newPositionMap.has(id)) {
              return [value, newPositionMap.get(id)!];
            } else {
              return [value, index];
            }
          })
          .sort((a, b) => a[1] - b[1])
          .map((value) => value[0]);
      });
    });
    return () => {
      currentGrid.off('change');
    };
  }, [getId, grid, setValues]);
}

interface SortableGridStackDefaultOptionsProps {
  itemsCount: number;
}

export function SortableGridStackDefaultOptions(
  props: SortableGridStackDefaultOptionsProps,
): GridStackOptions {
  const { itemsCount } = props;
  return {
    column: 1,
    margin: 4,
    maxRow: itemsCount,
    cellHeight: 80,
    disableResize: true,
    removable: false,
    alwaysShowResizeHandle: false,
    float: true,
  };
}

interface GridStackItemChange {
  id: string;
  x: number;
  y: number;
  h: number;
  w: number;
}
interface UseSubscribedGridStackChangesProps {
  grid: React.MutableRefObject<GridStack | undefined>;
  onChange(change: GridStackItemChange[]): void;
}

export function useSubscribedGridStackChanges(
  props: UseSubscribedGridStackChangesProps,
) {
  const { grid, onChange } = props;
  React.useLayoutEffect(() => {
    if (!grid.current) return;
    const currentGrid = grid.current;
    currentGrid.on('change', () => {
      const gridItems = currentGrid.getGridItems();
      const parsedGridItems = gridItems.map((item) => {
        const x = parseInt(item.getAttribute('gs-x')!, 10);
        const y = parseInt(item.getAttribute('gs-y')!, 10);
        const w = parseInt(item.getAttribute('gs-w')!, 10);
        const h = parseInt(item.getAttribute('gs-h')!, 10);
        return {
          id: item.getAttribute('gs-id')!,
          x,
          y,
          w,
          h,
        } as GridStackItemChange;
      });
      onChange(parsedGridItems);
    });
    return () => {
      currentGrid.off('change');
    };
  }, [grid, onChange]);
}
