import { DashboardItemModel } from '@/api/userdata';
import SubmitButton from '@/components/standard/button/submit';
import { CancelButton } from '@/components/standard/button/variants';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import { Button, Flex, Group, Modal, Text } from '@mantine/core';
import { TrashSimple, X } from '@phosphor-icons/react';
import React from 'react';

export const DashboardGridItemFullScreenModal = React.forwardRef<
  ParametrizedDisclosureTrigger<DashboardItemModel> | null,
  object
>(function DashboardGridItemFullScreen(props, ref) {
  const [item, { close }] = useParametrizedDisclosureTrigger(ref);
  return (
    <Modal
      size="xl"
      opened={!!item}
      onClose={close}
      transitionProps={{ transition: 'fade', duration: 200 }}
      fullScreen
      radius={0}
    >
      Renderer
    </Modal>
  );
});

interface DashboardGridItemDeleteModalProps {
  items: DashboardItemModel[];
  removeDashboardItem(index: number): void;
}
export const DashboardGridItemDeleteModal = React.forwardRef<
  ParametrizedDisclosureTrigger<DashboardItemModel> | null,
  DashboardGridItemDeleteModalProps
>(function ConfirmationDialog(props, ref) {
  const { items, removeDashboardItem } = props;
  const [item, { close }] = useParametrizedDisclosureTrigger(ref);
  const idx = item
    ? items.findIndex((dashboardItem) => dashboardItem.id === item.id)
    : undefined;

  return (
    <Modal
      opened={!!item}
      onClose={close}
      centered
      title="Delete Dashboard Item?"
    >
      <Text pb={16}>
        Are you sure you want to delete this dashboard item? You can always
        create the dashboard item again from the &quot;Add Visualization&quot;
        button.
      </Text>
      <Flex direction="row-reverse" gap={8}>
        <CancelButton onClick={close} />
        <Button
          variant="filled"
          leftSection={<TrashSimple />}
          color={'red'}
          onClick={() => {
            if (idx == null) return;
            removeDashboardItem(idx);
            close();
          }}
        >
          Delete
        </Button>
      </Flex>
    </Modal>
  );
});

interface DashboardGridItemEditModalProps {
  items: DashboardItemModel[];
  setDashboardItem(index: number, item: DashboardItemModel): void;
}
export const DashboardGridItemEditModal = React.forwardRef<
  ParametrizedDisclosureTrigger<DashboardItemModel> | null,
  DashboardGridItemEditModalProps
>(function AddTableVisualizationDialog(props, ref) {
  const { items, setDashboardItem } = props;
  const [item, { close }] = useParametrizedDisclosureTrigger(ref);
  const idx = item
    ? items.findIndex((dashboardItem) => dashboardItem.id === item.id)
    : undefined;
  return (
    <Modal opened={!!item} onClose={close} title="Edit Dashboard Item">
      <Group justify="end">
        <CancelButton onClick={close} />
        <SubmitButton>Save</SubmitButton>
      </Group>
    </Modal>
  );
});
