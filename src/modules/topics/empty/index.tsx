import { TextualSchemaColumnModel } from '@/api/project';
import React from 'react';
import { Button, Stack, Text } from '@mantine/core';
import useTopicModelingActions from './status-check';

interface ProjectTopicsEmptyPageProps {
  column: TextualSchemaColumnModel;
}

export default function ProjectTopicsEmptyPage(
  props: ProjectTopicsEmptyPageProps,
) {
  const { column } = props;

  const { onStartTopicModeling, startTopicModelingButtonIsLoading, progress } =
    useTopicModelingActions(column.name);

  // TODO: Angeline
  return (
    <Stack>
      <Button
        onClick={onStartTopicModeling}
        loading={startTopicModelingButtonIsLoading}
      >
        Discover Topics
      </Button>
      {progress?.logs.map((log) => (
        <Text
          key={log.timestamp!}
        >{`${log.status} ${log.timestamp} ${log.message}`}</Text>
      ))}
    </Stack>
  );
}
