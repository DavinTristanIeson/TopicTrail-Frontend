import { Divider, Stack, Title, Text, Group, Alert } from '@mantine/core';
import TopicResultsPageControls from './controls';
import DocumentsPerTopicTable from './documents-table';
import { client } from '@/common/api/client';
import React from 'react';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import { TableFilterModel } from '@/api/table';
import { TableFilterButton } from '@/modules/filter/drawer';
import { TopicMultiSelectInput } from './select-topic-input';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TableSkeleton } from '@/components/visual/loading';
import { TopicModel, TopicModelingResultModel } from '@/api/topic';
import { FilterStateContext } from '@/modules/table/context';
import { useDebouncedValue } from '@mantine/hooks';

interface TopicSelectorProps {
  data: TopicModelingResultModel;
}

function TopicSelector(props: TopicSelectorProps) {
  const { data } = props;
  const [topics, setTopics] = React.useState<TopicModel[]>([]);
  const [debouncedTopics] = useDebouncedValue(topics, 1000, {
    leading: false,
  });
  return (
    <>
      <TopicMultiSelectInput
        label="Topic"
        required
        data={data.topics}
        value={topics.map((topic) => topic.id) ?? []}
        onChange={setTopics}
        withOutlier
      />
      {topics.length === 0 && (
        <Alert color="yellow">Choose a topic to get started.</Alert>
      )}
      {topics.length > 0 && (
        <>
          <div className="h-72 bg-gray-300">Topic Words Area</div>
          <DocumentsPerTopicTable
            topicIds={debouncedTopics.map((topic) => topic.id)}
          />
        </>
      )}
    </>
  );
}

function ProjectTopicsFilter() {
  const project = React.useContext(ProjectContext);
  const column = React.useContext(SchemaColumnContext);
  const [filter, setFilter] = React.useState<TableFilterModel | null>(null);
  const query = client.useQuery('post', '/topic/{project_id}/topics', {
    params: {
      path: {
        project_id: project.id,
      },
      query: {
        column: column.name,
      },
    },
    body: {
      filter,
    },
  });

  return (
    <FilterStateContext.Provider value={{ filter, setFilter }}>
      <Group justify="end">
        <TableFilterButton />
      </Group>
      <UseQueryWrapperComponent
        loadingComponent={<TableSkeleton />}
        query={query}
      >
        {(data) => <TopicSelector data={data.data} />}
      </UseQueryWrapperComponent>
    </FilterStateContext.Provider>
  );
}

export default function ProjectTopicResultsPage() {
  const column = React.useContext(SchemaColumnContext);
  return (
    <Stack className="w-full">
      <div>
        <Title order={2} ta="center">
          Topics of {column.name}
        </Title>
        {column.description && <Text ta="center">{column.description}</Text>}
      </div>
      <Group className="w-full">
        <div className="h-72 bg-gray-300 flex-1">Topic Visualization Area</div>
        <div className="max-w-sm">
          <TopicResultsPageControls />
        </div>
      </Group>
      <Divider />
      <ProjectTopicsFilter />
    </Stack>
  );
}
