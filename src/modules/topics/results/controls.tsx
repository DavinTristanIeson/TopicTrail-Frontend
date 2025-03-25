import React from 'react';
import { useStartTopicModeling } from '../behavior/procedure';
import { TopicModelingOptionFlagCheckboxes } from '../components/controls';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import { invalidateProjectDependencyQueries } from '@/api/project';
import { ArrowClockwise } from '@phosphor-icons/react';
import { Button, Modal } from '@mantine/core';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';

const RediscoverTopicsModal = React.forwardRef<DisclosureTrigger | null>(
  function RediscoverTopicsModal(props, ref) {
    const [opened, { close }] = useDisclosureTrigger(ref);
    const project = React.useContext(ProjectContext);
    const column = React.useContext(SchemaColumnContext);

    const startActions = useStartTopicModeling(column.name);
    const { onStartTopicModeling } = startActions;

    // Callback untuk button
    const onStart = React.useCallback(async () => {
      await onStartTopicModeling();
      invalidateProjectDependencyQueries(project.id);
    }, [onStartTopicModeling, project.id]);

    return (
      <Modal opened={opened} onClose={close}>
        <TopicModelingOptionFlagCheckboxes {...startActions} />
      </Modal>
    );
  },
);

export default function TopicResultsPageControls() {
  const project = React.useContext(ProjectContext);
  const modalRemote = React.useRef<DisclosureTrigger | null>(null);

  // TODO: Angeline
  // Requirements
  // - Tombol start pemodelan topik
  // - Tombol ke halaman Refine Topics
  // - Komponen ini hover di bagian kanan layar. Tidak usah ikut scroll
  // - Modal konfirmasi ketika tekan Rediscover Topics. Taruh TopicModelingOptionFlagCheckboxes di dalam sana.
  return (
    <>
      <RediscoverTopicsModal ref={modalRemote} />
      <Button
        onClick={() => {
          modalRemote.current?.open();
        }}
        leftSection={<ArrowClockwise />}
      >
        Re-discover Topics
      </Button>
    </>
  );
}
