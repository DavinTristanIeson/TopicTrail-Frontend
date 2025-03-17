import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { ActionIcon, Group, Modal, Paper, Text } from '@mantine/core';
import { CornersOut, PencilSimple, TrashSimple } from '@phosphor-icons/react';
import React from 'react';

const DashboardGridItemFullScreen = React.forwardRef<
  DisclosureTrigger | null,
  React.PropsWithChildren
>(function DashboardGridItemFullScreen(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  return (
    <Modal
      size="xl"
      opened={opened}
      onClose={close}
      transitionProps={{ transition: 'fade', duration: 200 }}
      fullScreen
      radius={0}
    >
      {opened && props.children}
    </Modal>
  );
});

function DashboardGridItemRenderer() {
  return <Text>Dashboard Item</Text>;
}

export default function DashboardGridItem() {
  const children = <DashboardGridItemRenderer />;
  const fullScreenRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <DashboardGridItemFullScreen ref={fullScreenRemote}>
        {children}
      </DashboardGridItemFullScreen>
      <Paper className="grid-stack-item-content p-2 select-none">
        <Group className="pb-2">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => fullScreenRemote.current?.open()}
          >
            <CornersOut size={24} />
          </ActionIcon>
          <div className="flex-1" />
          <ActionIcon color="red" variant="subtle">
            <TrashSimple size={24} />
          </ActionIcon>
          <ActionIcon variant="subtle">
            <PencilSimple size={24} />
          </ActionIcon>
        </Group>
        {children}
      </Paper>
      <DashboardGridItemFullScreen />
    </>
  );
}
