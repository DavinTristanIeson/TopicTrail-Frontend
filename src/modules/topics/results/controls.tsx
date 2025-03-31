import React from 'react';
import { useStartTopicModeling } from '../behavior/procedure';
import { TopicModelingOptionFlagCheckboxes } from '../components/controls';
import {
  ProjectContext,
  SchemaColumnContext,
  useCurrentTextualColumn,
} from '@/modules/project/context';
import { invalidateProjectDependencyQueries } from '@/api/project';
import { ArrowClockwise, DoorOpen } from '@phosphor-icons/react';
import {
  Text,
  Group,
  Button,
  Modal,
  Stack,
  Tooltip,
  Card,
} from '@mantine/core';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { queryClient } from '@/common/api/query-client';
import { client } from '@/common/api/client';

const RediscoverTopicsModal = React.forwardRef<DisclosureTrigger | null>(
  function RediscoverTopicsModal(props, ref) {
    const [opened, { close }] = useDisclosureTrigger(ref);
    const project = React.useContext(ProjectContext);
    const column = React.useContext(SchemaColumnContext);
    const { replace } = useRouter();

    const startActions = useStartTopicModeling(column.name);
    const { onStartTopicModeling } = startActions;

    const onStart = React.useCallback(async () => {
      await onStartTopicModeling();
      invalidateProjectDependencyQueries(project.id);
      queryClient.removeQueries({
        queryKey: client.queryOptions('get', '/topic/{project_id}/', {
          params: {
            path: {
              project_id: project.id,
            },
          },
        }).queryKey,
      });
      replace({
        pathname: NavigationRoutes.ProjectTopics,
        query: {
          id: project.id,
          ongoing: '1',
        },
      });
      close();
    }, [close, onStartTopicModeling, project.id, replace]);

    return (
      <Modal opened={opened} onClose={close} title="Re-discover Topics">
        <Text mb={20}>
          Are you sure you want to run the topic model again? This will clear
          the topic information.
        </Text>
        <TopicModelingOptionFlagCheckboxes {...startActions} />
        <Group mt="md" pr="md" style={{ justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={onStart}>Confirm</Button>
        </Group>
      </Modal>
    );
  },
);

export default function TopicResultsPageControls() {
  const router = useRouter();
  const project = React.useContext(ProjectContext);
  const column = useCurrentTextualColumn();
  const modalRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <>
      <RediscoverTopicsModal ref={modalRemote} />
      <Card>
        <Stack>
          <Tooltip label="Go to Refine Topics Page" withArrow>
            <Button
              onClick={() => {
                router.push({
                  pathname: NavigationRoutes.ProjectRefineTopics,
                  query: {
                    id: project.id,
                    column: column.name,
                  },
                });
              }}
              leftSection={<DoorOpen />}
            >
              Refine Topics
            </Button>
          </Tooltip>
          <Tooltip label="Re-run topic discovery process" withArrow>
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
      </Card>
    </>
  );
}
