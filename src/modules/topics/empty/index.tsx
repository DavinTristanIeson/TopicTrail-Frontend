import { TextualSchemaColumnModel } from '@/api/project';
import React from 'react';
import { Button, Stack, Text, Group, Badge, Card, ScrollArea } from '@mantine/core';
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
      hour12: false
    });
  };

  return (
    <Stack>
      <Button
        onClick={onStartTopicModeling}
        loading={startTopicModelingButtonIsLoading}
      >
        Discover Topics
      </Button>
      {progress?.logs && progress.logs.length > 0 && (
        <Card withBorder shadow="lg" p="md" radius="md" style={{ backgroundColor: '#E6E6FA', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Text size="lg" mb="sm">
            Topic Modeling Logs
          </Text>
          <ScrollArea style={{ flexGrow: 1, maxHeight: '80vh', overflowY: 'auto' }}>
            <Stack>
              {progress.logs.map((log) => (
                <Card key={log.timestamp ?? Math.random()} withBorder shadow="xs" p="sm" radius="md" style={{ backgroundColor: '#ffffff' }}>
                  <Group>
                    <Badge color={getStatusColor(log.status)}>{log.status}</Badge>
                    <Text size="sm" style={{ color: 'gray' }}>{formatTimestamp(log.timestamp)}</Text>
                  </Group>
                  <Text mt="xs" size="sm">{log.message}</Text>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        </Card>
      )}
    </Stack>
  );
}