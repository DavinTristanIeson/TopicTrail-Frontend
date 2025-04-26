import { getTopicColumnName, SchemaColumnModel } from '@/api/project';
import { getTopicLabel } from '@/api/topic';
import { DashboardItemModel } from '@/api/userdata';
import { filterByString, pickArrayByIndex } from '@/common/utils/iterable';
import { ProjectColumnSelectInput } from '@/modules/project/select-column-input';
import {
  AllTopicModelingResultContext,
  useTopicModelingResultOfColumn,
} from '@/modules/topics/components/context';
import { TopicInfo } from '@/modules/topics/components/info';
import {
  Affix,
  Button,
  Card,
  CloseButton,
  Group,
  List,
  Stack,
  TextInput,
} from '@mantine/core';
import { useDebouncedState, useDisclosure } from '@mantine/hooks';
import { FileSearch, MagnifyingGlass } from '@phosphor-icons/react';
import React from 'react';

interface TopicCheatsheetInnerProps {
  column: SchemaColumnModel;
}

function TopicCheatsheetInner(props: TopicCheatsheetInnerProps) {
  const { column } = props;
  const [q, setQ] = useDebouncedState<string | null>(null, 800);
  const topicModelingResult = useTopicModelingResultOfColumn(column.name);

  const filteredTopics = React.useMemo(() => {
    const topics = topicModelingResult?.result?.topics ?? [];
    if (!q) return topics;
    const indices = filterByString(
      q,
      topics.map((topic) => {
        return {
          label: getTopicLabel(topic),
          words: topic.words?.map((word) => word[0]),
          tags: topic.tags,
        };
      }),
    );
    return pickArrayByIndex(topics, indices);
  }, [topicModelingResult?.result?.topics, q]);

  return (
    <Stack>
      <TextInput
        leftSection={<MagnifyingGlass />}
        placeholder="Search for a topic by label, keyword, or tag"
        onChange={(e) => setQ(e.target.value)}
      />
      <List className="overflow-y-auto">
        {filteredTopics.map((topic) => {
          return (
            <List.Item key={topic.id}>
              <TopicInfo {...topic} />
            </List.Item>
          );
        })}
      </List>
    </Stack>
  );
}

interface TopicCheatsheetColumnSelectorProps {
  columns: SchemaColumnModel[];
}

function TopicCheatsheetColumnSelector(
  props: TopicCheatsheetColumnSelectorProps,
) {
  const { columns } = props;

  const [column, setColumn] = React.useState<SchemaColumnModel | null>(
    () => columns[0] ?? null,
  );

  React.useEffect(() => {
    setColumn(columns[0] ?? null);
  }, [columns]);

  if (columns.length === 1) {
    return <TopicCheatsheetInner column={columns[0]!} />;
  }

  return (
    <>
      <ProjectColumnSelectInput
        data={columns}
        value={column?.name ?? null}
        onChange={setColumn}
      />
      {column && <TopicCheatsheetInner column={column} key={column.name} />}
    </>
  );
}

interface DashboardTopicCheatsheetProps {
  dashboard: DashboardItemModel[];
}

export default function DashboardTopicCheatsheet(
  props: DashboardTopicCheatsheetProps,
) {
  const { dashboard } = props;
  const [opened, { toggle, close }] = useDisclosure();
  const allTopicModelingResults = React.useContext(
    AllTopicModelingResultContext,
  );
  const supportedColumns = React.useMemo(() => {
    const allUniqueDashboardColumns = new Set(
      dashboard.map((item) => item.column),
    );
    return allTopicModelingResults
      .filter((result) => !!result.result)
      .filter((column) =>
        allUniqueDashboardColumns.has(getTopicColumnName(column.column.name)),
      )
      .map((result) => result.column);
  }, [allTopicModelingResults, dashboard]);

  if (supportedColumns.length === 0) {
    return null;
  }

  return (
    <Affix bottom={16} right={16}>
      <Card
        className="max-w-lg"
        style={{
          height: opened ? '80dvh' : undefined,
          maxHeight: opened ? '80dvh' : undefined,
        }}
        withBorder
      >
        {opened && (
          <>
            <Group justify="end" className="pb-3">
              <CloseButton onClick={close} />
            </Group>
            <TopicCheatsheetColumnSelector columns={supportedColumns} />
          </>
        )}
        {!opened && (
          <Button
            leftSection={<FileSearch />}
            onClick={toggle}
            variant="subtle"
          >
            View Topic Cheatsheet
          </Button>
        )}
      </Card>
    </Affix>
  );
}
