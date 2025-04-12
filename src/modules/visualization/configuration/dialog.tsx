import { DashboardItemModel } from '@/api/userdata';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
  useDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import { Alert, Button, Modal } from '@mantine/core';
import { Info, Plus } from '@phosphor-icons/react';
import React from 'react';
import VisualizationConfigurationForm from '.';

interface VisualizationConfigurationDialogProps {
  onSubmit(item: DashboardItemModel): void;
}

export const AddVisualizationConfigurationDialog = React.forwardRef<
  DisclosureTrigger | null,
  VisualizationConfigurationDialogProps
>(function AddVisualizationConfigurationDialog(props, ref) {
  const { onSubmit } = props;
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
      <VisualizationConfigurationForm
        onClose={close}
        data={undefined}
        onSubmit={onSubmit}
      />
    </Modal>
  );
});

export const VisualizationConfigurationDialog = React.forwardRef<
  ParametrizedDisclosureTrigger<DashboardItemModel> | null,
  VisualizationConfigurationDialogProps
>(function VisualizationConfigurationDialog(props, ref) {
  const { onSubmit } = props;
  const [item, { close }] = useParametrizedDisclosureTrigger(ref);
  return (
    <Modal opened={!!item} onClose={close} title="Edit Visualization Component">
      <VisualizationConfigurationForm
        onClose={close}
        data={undefined}
        onSubmit={onSubmit}
      />
    </Modal>
  );
});

export function AddVisualizationConfigurationButton(
  props: VisualizationConfigurationDialogProps,
) {
  const remote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <AddVisualizationConfigurationDialog ref={remote} {...props} />
      <Button
        leftSection={<Plus />}
        onClick={() => {
          remote.current?.open();
        }}
      >
        Add Visualization
      </Button>
    </>
  );
}
