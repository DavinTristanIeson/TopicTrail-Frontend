import { Button, Group } from '@mantine/core';
import { Plus } from '@phosphor-icons/react';
import AddTableVisualizationDialog from './add-visualization-dialog';
import React from 'react';
import { DisclosureTrigger } from '@/hooks/disclosure';

export default function TableDashboard() {
  const addTableDialogRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <AddTableVisualizationDialog ref={addTableDialogRemote} />
      <Group justify="end">
        <Button
          leftSection={<Plus />}
          onClick={() => {
            addTableDialogRemote.current?.open();
          }}
        >
          Add Visualization
        </Button>
      </Group>
    </>
  );
}
