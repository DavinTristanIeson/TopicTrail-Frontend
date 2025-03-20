import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import { ProjectColumnSelectInput } from '@/modules/project/select-column-input';
import {
  AllTopicModelingResultContext,
  ProjectAllTopicsProvider,
  TopicModelingResultContext,
  TopicModelingResultSelector,
} from '@/modules/topics/components/context';
import { Alert, Anchor, Group, Stack, Text } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import React from 'react';
import NavigationRoutes from '@/common/constants/routes';
import ProjectTopicsEmptyPage from '@/modules/topics/empty';
import ProjectTopicsPage from '@/modules/topics';
import Link from 'next/link';

function ProjectTopicSwitcher() {
  const { column, result } = React.useContext(TopicModelingResultContext);
  if (!result) {
    return <ProjectTopicsEmptyPage column={column} />;
  }
  return <ProjectTopicsPage column={column} result={result} />;
}

function ProjectTopicColumnManager() {
  const project = React.useContext(ProjectContext);
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
      {columns.length === 0 && (
        <Alert icon={<Warning />} color="yellow">
          There are no textual columns in your dataset, which means that the{' '}
          <Text className="font-semibold" span inherit>
            Topics
          </Text>{' '}
          and{' '}
          <Text className="font-semibold" span inherit>
            Topic Correlation
          </Text>{' '}
          page will not be useful to you. Consider using the{' '}
          <Anchor
            component={Link}
            href={{
              pathname: NavigationRoutes.ProjectComparison,
              query: {
                id: project.id,
              },
            }}
            inherit
          >
            Table Page
          </Anchor>{' '}
          or{' '}
          <Anchor
            component={Link}
            href={{
              pathname: NavigationRoutes.ProjectComparison,
              query: {
                id: project.id,
              },
            }}
            inherit
          >
            Comparison Page
          </Anchor>{' '}
          instead.
        </Alert>
      )}
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
