import { Button, Group, Paper } from '@mantine/core';
import { Plus } from '@phosphor-icons/react';
import AddTableVisualizationDialog from './add-visualization-dialog';
import React from 'react';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { useControlledGridstack } from '@/hooks/gridstack';
import { type GridStackWidget } from 'gridstack';
import DashboardGridItem from './grid-item';

function DashboardGridstackRenderer() {
  const ids = React.useMemo(() => {
    return Array.from({ length: 10 }, (_, index) =>
      Math.random().toString(16).substring(2),
    );
  }, []);
  const makeWidget = React.useCallback(
    (id: string, element: HTMLDivElement) => {
      return {
        id,
        minH: 3,
        minW: 3,
      } as GridStackWidget;
    },
    [],
  );
  const { id, grid, gridElements } = useControlledGridstack({
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
          <div className="grid-stack-item" ref={gridElements.current[id]}>
            <DashboardGridItem />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TableDashboard() {
  const addTableDialogRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <AddTableVisualizationDialog ref={addTableDialogRemote} />
      <Group justify="end" className="pb-3">
        <Button
          leftSection={<Plus />}
          onClick={() => {
            addTableDialogRemote.current?.open();
          }}
        >
          Add Visualization
        </Button>
      </Group>
      <DashboardGridstackRenderer />
    </>
  );
}
