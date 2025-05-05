import { TaskLogModel } from '@/api/topic';
import { TaskStatusEnum } from '@/common/constants/enum';
import {
  Card,
  ScrollArea,
  Stack,
  Group,
  Badge,
  Text,
  type MantineColor,
  Loader,
} from '@mantine/core';
import { QuestionMark } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import PromiseButton from '@/components/standard/button/promise';
import { usePolling } from '@/hooks/polling';
import React from 'react';
import { useDisclosure } from '@mantine/hooks';
import { usePeriodicTaskStatusCheck } from './status-check';

const TASK_STATUS_COLORS: Record<TaskStatusEnum, MantineColor> = {
  [TaskStatusEnum.Success]: 'green',
  [TaskStatusEnum.Pending]: 'yellow',
  [TaskStatusEnum.Failed]: 'red',
  [TaskStatusEnum.Idle]: 'gray',
};

function LogItemComponent(props: TaskLogModel) {
  return (
    <Card
      key={props.timestamp}
      withBorder
      shadow="xs"
      p="sm"
      radius="md"
      color="white"
    >
      <Group>
        <Badge color={TASK_STATUS_COLORS[props.status]}>{props.status}</Badge>
        <Text size="sm" c="gray">
          {dayjs(props.timestamp).format('DD MMMM YYYY, HH:mm:ss')}
        </Text>
      </Group>
      <Text mt="xs" size="sm">
        {props.message}
      </Text>
    </Card>
  );
}

interface LastCheckedTimerProps {
  date: Date;
}

function LastCheckedTimer(props: LastCheckedTimerProps) {
  const { date } = props;
  const [, { toggle }] = useDisclosure();
  usePolling({
    interval: 1000,
    fn: toggle,
  });
  return <Text size="xs">{`Last checked: ${dayjs(date).fromNow()}`}</Text>;
}

type TaskProgressLogsProps = ReturnType<typeof usePeriodicTaskStatusCheck>;
export default function TaskProgressLogs(props: TaskProgressLogsProps) {
  const { progress, dataUpdatedAt, checkAgain, isStillPolling } = props;
  if (!progress || progress.logs.length === 0) {
    return null;
  }
  return (
    <Card
      withBorder
      shadow="lg"
      p="md"
      radius="md"
      style={{
        backgroundColor: '#E6E6FA',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Text size="lg" mb="sm">
        Execution Logs
      </Text>
      <ScrollArea style={{ flexGrow: 1, maxHeight: '80vh', overflowY: 'auto' }}>
        <Stack>
          {progress.logs.map((log) => (
            <LogItemComponent {...log} key={log.timestamp ?? log.message} />
          ))}
          {isStillPolling ? (
            <Group justify="center">
              <Loader type="dots" />
            </Group>
          ) : undefined}
          <Stack gap={2}>
            <PromiseButton
              leftSection={<QuestionMark />}
              onClick={() => checkAgain()}
              className="max-w-sm"
            >
              Check Status
            </PromiseButton>
            {dataUpdatedAt && <LastCheckedTimer date={dataUpdatedAt} />}
          </Stack>
        </Stack>
      </ScrollArea>
    </Card>
  );
}
