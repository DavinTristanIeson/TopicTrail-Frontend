import { TextualSchemaColumnModel } from '@/api/project';
import React, { useState } from 'react';
import { Button, Stack, Text, Group, Badge, Card, ScrollArea, Checkbox, Tooltip } from '@mantine/core';
import { Play } from "@phosphor-icons/react";
import useTopicModelingActions from './status-check';
import { TaskStatusEnum } from '@/common/constants/enum';

interface ProjectTopicsEmptyPageProps {
  column: TextualSchemaColumnModel;
}

export default function ProjectTopicsEmptyPage(
  props: ProjectTopicsEmptyPageProps,
) {
  const { column } = props;
  const [useCachedDocVectors, setUseCachedDocVectors] = useState(true);
  const [useCachedUMAP, setUseCachedUMAP] = useState(true);
  const [useCachedPreprocessedDocs, setUseCachedPreprocessedDocs] = useState(true);

  const { 
    onStartTopicModeling, 
    startTopicModelingButtonIsLoading, 
    progress
  } = useTopicModelingActions(column.name, useCachedDocVectors, useCachedUMAP, useCachedPreprocessedDocs);

  

  const getStatusColor = (status: TaskStatusEnum) => {
    switch (status.toLowerCase()) {
      case TaskStatusEnum.Success:
        return 'green';
      case TaskStatusEnum.Pending:
        return 'yellow';
      case TaskStatusEnum.Failed:
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
      {/* Header dengan Play Icon dan Teks sejajar */}
      <Group align="center">
        {/* Ikon Play dalam Lingkaran */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '8px solid black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Play size={40} weight="fill" color="black" />
        </div>

        {/* Stack untuk judul & teks tetap sejajar */}
        <div style={{ flex: 1, maxWidth: 600 }}>
          <Text fw={700} size="xl">Discover Topics</Text>
          <Text size="sm">
            Our algorithm will scan all of the textual columns in your dataset to try and find common keywords from documents that discuss the same theme or concept.
          </Text>
        </div>
      </Group>

      <Group align="flex-start">
        <Stack>
          <Tooltip label="Computing document vectors can be time-consuming, so it is recommended to use cached document vectors. Unless you have changed the topic modeling configuration for this column." maw={250} multiline>
            <Checkbox
              label="Use cached document vectors"
              checked={useCachedDocVectors}
              onChange={(event) => setUseCachedDocVectors(event.currentTarget.checked)}
            />
          </Tooltip>

          <Tooltip label="Computing UMAP vectors can take a long time, so it is recommended to use cached UMAP vectors. Unless you have modified the topic modeling configuration for this column" maw={250} multiline>
            <Checkbox
              label="Use cached UMAP vectors"
              checked={useCachedUMAP}
              onChange={(event) => setUseCachedUMAP(event.currentTarget.checked)}
            />
          </Tooltip>

          <Tooltip label="The preprocessing stage can be time-consuming, so it is recommended to use cached preprocessed documents. Unless you have changed the preprocessing configuration for this column." maw={250} multiline>
            <Checkbox
              label="Use cached preprocessed documents"
              checked={useCachedPreprocessedDocs}
              onChange={(event) => setUseCachedPreprocessedDocs(event.currentTarget.checked)}
            />
          </Tooltip>
        </Stack>
      </Group>

      <Button
          onClick={onStartTopicModeling}
          loading={startTopicModelingButtonIsLoading}
        >
          Start Topic Modeling
        </Button>

      {progress?.logs && progress.logs.length > 0 && (
        <Card withBorder shadow="lg" p="md" radius="md" style={{ backgroundColor: '#E6E6FA', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Text size="lg" mb="sm">
            Topic Modeling Execution Logs
          </Text>
          <ScrollArea style={{ flexGrow: 1, maxHeight: '80vh', overflowY: 'auto' }}>
            <Stack>
              {progress.logs.map((log) => (
                <Card key={log.timestamp ?? Math.random()} withBorder shadow="xs" p="sm" radius="md" style={{ backgroundColor: '#ffffff' }}>
                  <Group>
                    <Badge color={getStatusColor(log.status as TaskStatusEnum)}>{log.status}</Badge>
                    <Text size="sm" c='gray'>{formatTimestamp(log.timestamp)}</Text>
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