import AppProjectLayout from '@/modules/project/layout';
import { ProjectColumnSelectInput } from '@/modules/project/select-column-input';
import {
  AllTopicModelingResultContext,
  ProjectAllTopicsProvider,
  TopicModelingResultContext,
  TopicModelingResultSelector,
} from '@/modules/topics/components/context';
import { Group, Stack, Text } from '@mantine/core';
import React from 'react';
import ProjectTopicsEmptyPage from '@/modules/topics/empty';
import ProjectTopicsPage from '@/modules/topics';
import { NoTextualColumnWarning } from '@/modules/topics/components/warnings';

function ProjectTopicSwitcher() {
  const { column, result } = React.useContext(TopicModelingResultContext);
  if (!result) {
    return <ProjectTopicsEmptyPage column={column} />;
  }
  return <ProjectTopicsPage column={column} result={result} />;
}

function ProjectTopicColumnManager() {
  const topicModelingResults = React.useContext(AllTopicModelingResultContext);
  const [column, setColumn] = React.useState<string | null>(null);

  const columns = topicModelingResults.map((result) => result.column);
  const firstColumn = columns[0];

  const hasInitializedColumn = React.useRef(false);
  React.useEffect(() => {
    if (hasInitializedColumn.current) return;
    if (!firstColumn) return;
    setColumn(firstColumn.name);
    hasInitializedColumn.current = true;
  }, [firstColumn]);

  return (
    <Stack>
      <ProjectColumnSelectInput
        data={columns}
        value={column}
        onChange={(col) => setColumn(col?.name ?? null)}
        allowDeselect={false}
        styles={{
          input: {
            width: 384,
          },
        }}
        disabled={columns.length === 0}
        inputContainer={(children) => (
          <Group>
            <Text c="gray" size="sm">
              Column
            </Text>
            {children}
          </Group>
        )}
      />
      {columns.length === 0 && <NoTextualColumnWarning />}
      {column && (
        <TopicModelingResultSelector column={column}>
          <ProjectTopicSwitcher />
        </TopicModelingResultSelector>
      )}
    </Stack>
  );
}

export default function ProjectTopics() {
  return (
    <AppProjectLayout>
      <ProjectAllTopicsProvider>
        <ProjectTopicColumnManager />
      </ProjectAllTopicsProvider>
    </AppProjectLayout>
  );
}
