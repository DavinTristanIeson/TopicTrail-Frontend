import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import UserDataManager from '@/modules/userdata';
import { useTableDashboardDataManager } from '@/modules/userdata/data-manager';
import { Alert, Button, Group, Modal, Stack } from '@mantine/core';
import { Info, Plus, X } from '@phosphor-icons/react';
import React from 'react';

const AddTableVisualizationDialog = React.forwardRef<DisclosureTrigger, object>(
  function AddTableVisualizationDialog(props, ref) {
    const [opened, { close }] = useDisclosureTrigger(ref);
    return (
      <Modal
        opened={opened}
        onClose={close}
        title="Add a New Visualization Component"
      >
        <Alert
          color="blue"
          title="What are visualizations for?"
          icon={<Info size={20} />}
        >
          Humans absorb information more easily with images rather than text or
          numbers. Rather than reading through your dataset row per row, why not
          refer to these graphs to help you get a bird&apos;s eye view over the
          dataset? These visualization components will also be affected by the
          filters you have set on your dataset.
        </Alert>
        <Group justify="end">
          <Button leftSection={<X />} color="red" onClick={close}>
            Cancel
          </Button>
          <Button leftSection={<Plus />} onClick={() => {}}>
            Add
          </Button>
        </Group>
      </Modal>
    );
  },
);

function DashboardStateManager() {
  const rendererProps = useTableDashboardDataManager({
    onApply() {
      alert('TODO');
    },
    state: null,
  });
  return <UserDataManager {...rendererProps} label="Dashboard" />;
}

export function DashboardControls() {
  const addTableDialogRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <AddTableVisualizationDialog ref={addTableDialogRemote} />
      <Stack>
        <DashboardStateManager />
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
      </Stack>
    </>
  );
}
