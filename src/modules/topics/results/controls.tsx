import React from 'react';
import { useStartTopicModeling } from '../behavior/procedure';
import { TopicModelingOptionFlagCheckboxes } from '../components/controls';
import { ProjectContext } from '@/modules/project/context';
import {
  invalidateProjectDependencyQueries,
  SchemaColumnModel,
} from '@/api/project';
import { ArrowClockwise, DoorOpen } from '@phosphor-icons/react';
import { Text, Group, Button, Modal, Tooltip } from '@mantine/core';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { queryClient } from '@/common/api/query-client';
import { client } from '@/common/api/client';

interface RediscoverTopicsModalProps {
  column: SchemaColumnModel;
}

const RediscoverTopicsModal = React.forwardRef<
  DisclosureTrigger | null,
  RediscoverTopicsModalProps
>(function RediscoverTopicsModal(props, ref) {
  const { column } = props;
  const [opened, { close }] = useDisclosureTrigger(ref);
  const project = React.useContext(ProjectContext);
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
        column: column.name,
        ongoing: '1',
      },
    });
    close();
  }, [close, column.name, onStartTopicModeling, project.id, replace]);

  return (
    <Modal opened={opened} onClose={close} title="Re-discover Topics">
      <Text mb={20}>
        Are you sure you want to run the topic model again? This will clear the
        topic information.
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
});

interface TopicResultsPageControlsProps {
  column: SchemaColumnModel;
}

export default function TopicResultsPageControls(
  props: TopicResultsPageControlsProps,
) {
  const { column } = props;
  const router = useRouter();
  const project = React.useContext(ProjectContext);
  const modalRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <>
      <RediscoverTopicsModal ref={modalRemote} column={column} />
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
          variant="outline"
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
          variant="outline"
        >
          Re-discover Topics
        </Button>
      </Tooltip>
    </>
  );
}
