import React from 'react';
import { useStartTopicModeling } from '../behavior/procedure';
import { TopicModelingOptionFlagCheckboxes } from '../components/controls';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import { invalidateProjectDependencyQueries } from '@/api/project';
import { ArrowClockwise } from '@phosphor-icons/react';
import { Text, Group, Button, Modal, Box, Stack, Tooltip } from '@mantine/core';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';

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
      close();
    }, [onStartTopicModeling, project.id]);

    return (
      <Modal opened={opened} onClose={close} title="Re-discover Topics">
        <Text mb={20}>
          Are you sure you want to run the topic model again? This will clear the topic information.
        </Text>
        <TopicModelingOptionFlagCheckboxes {...startActions} />
        <Group mt="md" pr="md" style={{ justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={onStart}>Confirm</Button>
        </Group>
      </Modal>
    );
  },
);

export default function TopicResultsPageControls() {
  const router = useRouter();
  const project = React.useContext(ProjectContext);
  const modalRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <>
      <RediscoverTopicsModal ref={modalRemote} />
      <Box style={{ backgroundColor:'white', padding: '12px', borderRadius: '8px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #ccc'}}>
        <Stack>
          <Tooltip label="Go to Refine Topics Page" withArrow style={{ border: '1px solid #ccc' }}>
            <Button
              onClick={() => {
                router.push({
                  pathname: NavigationRoutes.ProjectRefineTopics,
                  query: {
                    id: project.id,
                  },
                });
              }}
            >
              Refine Topic
            </Button>
          </Tooltip>
          <Tooltip label="Re-run topic discovery process" withArrow style={{ border: '1px solid #ccc' }}>
            <Button
              onClick={() => {
                modalRemote.current?.open();
              }}
              leftSection={<ArrowClockwise />}
            >
              Re-discover Topics
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </>
  );
}
