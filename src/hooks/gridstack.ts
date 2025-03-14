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
