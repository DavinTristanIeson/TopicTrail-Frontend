import React from 'react';
import { useStartTopicModeling } from '../behavior/procedure';
import { TopicModelingOptionFlagCheckboxes } from '../components/controls';
import { ProjectContext } from '@/modules/project/context';
import { SchemaColumnModel } from '@/api/project';
import {
  ArrowClockwise,
  CaretDown,
  CheckCircle,
  Exam,
  TestTube,
  Wrench,
} from '@phosphor-icons/react';
import { Text, Group, Button, Modal, Popover, Stack } from '@mantine/core';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import NavigationRoutes from '@/common/constants/routes';
import { CancelButton } from '@/components/standard/button/variants';
import PromiseButton from '@/components/standard/button/promise';
import { useRouter } from 'next/router';

interface RediscoverTopicsModalProps {
  column: SchemaColumnModel;
}

const RediscoverTopicsModal = React.forwardRef<
  DisclosureTrigger | null,
  RediscoverTopicsModalProps
>(function RediscoverTopicsModal(props, ref) {
  const { column } = props;
  const [opened, { close }] = useDisclosureTrigger(ref);
  const startActions = useStartTopicModeling(column.name);

  const { onStartTopicModeling } = startActions;

  const onStart = React.useCallback(async () => {
    await onStartTopicModeling();
    close();
  }, [close, onStartTopicModeling]);

  return (
    <Modal opened={opened} onClose={close} title="Re-discover Topics">
      <Text mb={20}>
        Are you sure you want to run the topic model again? This will clear the
        topic information.
      </Text>
      <TopicModelingOptionFlagCheckboxes {...startActions} />
      <Group mt="md" pr="md" style={{ justifyContent: 'flex-end' }}>
        <CancelButton onClick={close}>Cancel</CancelButton>
        <PromiseButton onClick={onStart} leftSection={<CheckCircle />}>
          Confirm
        </PromiseButton>
      </Group>
    </Modal>
  );
});

interface TopicResultRedirectButtonProps {
  route: NavigationRoutes;
  icon: React.ReactNode;
  label: string;
}

function TopicResultRedirectButton(props: TopicResultRedirectButtonProps) {
  const { route, icon, label } = props;
  const project = React.useContext(ProjectContext);
  const { push } = useRouter();

  return (
    <Button
      variant="subtle"
      leftSection={icon}
      onClick={() => {
        push({
          pathname: route,
          query: {
            id: project.id,
          },
        });
      }}
      classNames={{
        label: 'w-full',
      }}
    >
      {label}
    </Button>
  );
}
interface TopicResultsPageControlsProps {
  column: SchemaColumnModel;
}

export default function TopicResultsPageControls(
  props: TopicResultsPageControlsProps,
) {
  const { column } = props;
  const modalRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <>
      <RediscoverTopicsModal ref={modalRemote} column={column} />
      <Popover>
        <Popover.Target>
          <Button leftSection={<CaretDown />}>Actions</Button>
        </Popover.Target>
        <Popover.Dropdown className="p-1">
          <Stack>
            <TopicResultRedirectButton
              icon={<Wrench />}
              route={NavigationRoutes.ProjectRefineTopics}
              label="Refine Topics"
            />
            <TopicResultRedirectButton
              icon={<Exam />}
              route={NavigationRoutes.ProjectTopicEvaluation}
              label="Topic Evaluation"
            />
            <TopicResultRedirectButton
              icon={<TestTube />}
              route={NavigationRoutes.ProjectTopicModelExperiment}
              label="Topic Model Experiments"
            />
          </Stack>
        </Popover.Dropdown>
      </Popover>

      <Button
        onClick={() => {
          modalRemote.current?.open();
        }}
        leftSection={<ArrowClockwise />}
        variant="outline"
      >
        Re-discover Topics
      </Button>
    </>
  );
}
