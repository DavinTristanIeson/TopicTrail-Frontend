import { DisclosureTrigger } from '@/hooks/disclosure';
import { Group, Button } from '@mantine/core';
import { Plus } from '@phosphor-icons/react';
import React from 'react';
import AddTableVisualizationDialog from './add-visualization-dialog';
import dynamic from 'next/dynamic';
import { GridSkeleton } from '@/components/visual/loading';

const GridstackDashboard = dynamic(() => import('./dashboard'), {
  ssr: false,
  loading: GridSkeleton,
});

export default function DashboardManager() {
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
      <GridstackDashboard />
    </>
  );
}
