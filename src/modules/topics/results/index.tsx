import {
  Divider,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Indicator,
  Alert,
  Grid
} from '@mantine/core';
import TopicResultsPageControls from './controls';
import DocumentsPerTopicTable from './documents-table';
import { client } from '@/common/api/client';
import React from 'react';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import { TableFilterModel } from '@/api/table';
import TableFilterDrawer from '@/modules/filter/drawer';
import { Funnel } from '@phosphor-icons/react';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { TopicSelectInput } from './select-topic-input';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TableSkeleton } from '@/components/visual/loading';
import { TopicModel, TopicModelingResultModel } from '@/api/topic';

interface TopicSelectorProps {
  filter: TableFilterModel | null;
  data: TopicModelingResultModel;
}

function TopicSelector(props: TopicSelectorProps) {
  const { filter, data } = props;
  const [topic, setTopic] = React.useState<TopicModel | null>(null);
  return (
    <>
      <TopicSelectInput
        label="Topic"
        required
        data={data.topics}
        value={topic?.id ?? null}
        onChange={setTopic}
      />
      {!topic && <Alert color="yellow">Choose a topic to get started.</Alert>}
      {topic && <div className="h-72 bg-gray-300">Topic Words Area</div>}
      {topic && <DocumentsPerTopicTable topic={topic.id} filter={filter} />}
    </>
  );
}

function ProjectTopicsFilter() {
  const project = React.useContext(ProjectContext);
  const column = React.useContext(SchemaColumnContext);
  const [filter, setFilter] = React.useState<TableFilterModel | null>(null);
  const query = client.useQuery('post', '/topics/{project_id}/topics', {
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

  const tableFilterRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <>
      <TableFilterDrawer
        ref={tableFilterRemote}
        filter={filter}
        setFilter={setFilter}
      />
      <Group justify="end">
        <Indicator disabled={!filter} color="red" zIndex={2}>
          <Button
            variant="outline"
            onClick={() => {
              tableFilterRemote.current?.open();
            }}
            leftSection={<Funnel />}
          >
            Filter
          </Button>
        </Indicator>
      </Group>
      <UseQueryWrapperComponent
        loadingComponent={<TableSkeleton />}
        query={query}
      >
        {(data) => <TopicSelector filter={filter} data={data.data} />}
      </UseQueryWrapperComponent>
    </>
  );
}

export default function ProjectTopicResultsPage() {
  const column = React.useContext(SchemaColumnContext);
  return (
    <Stack>
      <Grid align="center">
        <Grid.Col span={9}>
          <div>
            <Title order={2} ta="center">
              Topics of {column.name}
            </Title>
            {column.description && <Text ta="center">{column.description}</Text>}
          </div>
          <div className="h-72 bg-gray-300">Topic Visualization Area</div>
        </Grid.Col>
        <Grid.Col span={3}>
        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <TopicResultsPageControls />
          </div>
        </Grid.Col>
      </Grid>
      <Divider />
      <ProjectTopicsFilter />
    </Stack>
  );
}
