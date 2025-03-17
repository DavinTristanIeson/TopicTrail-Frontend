import { DisclosureTrigger } from '@/hooks/disclosure';
import { Group, Button } from '@mantine/core';
import { Plus } from '@phosphor-icons/react';
import React from 'react';
import AddTableVisualizationDialog from './add-visualization-dialog';
import GridstackDashboard from './dashboard';

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
