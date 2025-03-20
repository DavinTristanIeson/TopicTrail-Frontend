import { useControlledGridstack } from '@/hooks/gridstack';
import { type GridStackWidget } from 'gridstack';
import React from 'react';
import DashboardGridItem from './grid-item';

export default function GridstackDashboard() {
  const ids = React.useMemo(() => {
    return Array.from({ length: 10 }, () =>
      Math.random().toString(16).substring(2),
    );
  }, []);
  const makeWidget = React.useCallback((id: string) => {
    return {
      id,
      minH: 3,
      minW: 3,
    } as GridStackWidget;
  }, []);
  const { id, gridElements } = useControlledGridstack({
    gridItems: ids,
    options: {
      removable: false,
      margin: 4,
    },
    makeWidget,
  });
  return (
    <div className="rounded color-gray-100">
      <div className="grid-stack" id={id}>
        {ids.map((id) => (
          <div
            className="grid-stack-item"
            ref={gridElements.current[id]}
            key={id}
          >
            <DashboardGridItem />
          </div>
        ))}
      </div>
    </div>
  );
}
