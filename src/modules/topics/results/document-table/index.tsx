import { client } from '@/common/api/client';
import {
  ProjectContext,
  useCurrentTextualColumn,
} from '@/modules/project/context';
import React from 'react';
import { TableFilterModel } from '@/api/table';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TableSkeleton } from '@/components/visual/loading';
import { Alert, Group, Stack, TextInput } from '@mantine/core';
import { TableStateContext } from '@/modules/table/context';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import {
  getPreprocessedDocumentsColumnName,
  getTopicColumnName,
} from '@/api/project';
import { keepPreviousData } from '@tanstack/react-query';
import { Warning } from '@phosphor-icons/react';
import { useDebouncedValue } from '@mantine/hooks';
import { useTopicModelingResultOfColumn } from '../../components/context';
import { TopicMultiSelectInput } from '../../components/select-topic-input';
import { DocumentsPerTopicTableRenderer } from './renderer';
import { useTopicAppState } from '../../app-state';
interface UseDocumentsPerTopicTableFilterStateProps {
  columnName: string;
  filter: TableFilterModel | null;
}

function useDocumentsPerTopicTableFilterState(
  props: UseDocumentsPerTopicTableFilterStateProps,
) {
  const { columnName, filter } = props;
  const topics = useTopicAppState((store) => store.documents.topics);
  const setTopics = useTopicAppState((store) => store.documents.setTopics);
  const [search, setSearch] = React.useState('');
  const [debouncedTopics] = useDebouncedValue(topics, 1000);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const topicsFilter: TableFilterModel | undefined =
    debouncedTopics.length > 0
      ? {
          type: TableFilterTypeEnum.IsOneOf,
          target: getTopicColumnName(columnName),
          values: debouncedTopics.map((topic) => topic.id),
        }
      : undefined;
  const searchFilter: TableFilterModel | undefined = debouncedSearch
    ? {
        type: TableFilterTypeEnum.Or,
        operands: [
          {
            type: TableFilterTypeEnum.HasText,
            target: columnName,
            value: debouncedSearch,
          },
          {
            type: TableFilterTypeEnum.HasText,
            target: getPreprocessedDocumentsColumnName(columnName),
            value: debouncedSearch,
          },
        ],
      }
    : undefined;

  const finalFilter: TableFilterModel = {
    type: TableFilterTypeEnum.And,
    operands: [filter!, topicsFilter!, searchFilter!].filter(Boolean),
  };

  return { filter: finalFilter, setSearch, setTopics, topics, search };
}

export default function DocumentsPerTopicTable() {
  const project = React.useContext(ProjectContext);
  const column = useCurrentTextualColumn();
  const topicModelingResult = useTopicModelingResultOfColumn(column.name);

  const tableState = useTopicAppState((store) => store.documents.params);
  const { page, limit, sort, filter: localFilter } = tableState;
  const { filter, setSearch, setTopics, topics, search } =
    useDocumentsPerTopicTableFilterState({
      columnName: column.name,
      filter: localFilter,
    });

  const query = client.useQuery(
    'post',
    '/topic/{project_id}/documents',
    {
      params: {
        query: {
          column: column.name,
        },
        path: {
          project_id: project.id,
        },
      },
      body: {
        page,
        limit,
        sort,
        filter,
      },
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  return (
    <Stack>
      <Group align="start">
        <TopicMultiSelectInput
          label="Topic(s)"
          required
          data={topicModelingResult?.result?.topics ?? []}
          value={topics.map((topic) => topic.id)}
          onChange={setTopics}
          withOutlier
          miw={512}
        />
        <TextInput
          label="Search"
          placeholder="Search for a keyword/substring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          miw={512}
        />
      </Group>
      {topics.length === 0 && (
        <Alert color="yellow" icon={<Warning />}>
          Choose a topic to get started.
        </Alert>
      )}
      <UseQueryWrapperComponent
        query={query}
        isLoading={query.isFetching && !query.data}
        loadingComponent={<TableSkeleton />}
      >
        <Stack>
          <TableStateContext.Provider value={tableState}>
            {query.data && (
              <DocumentsPerTopicTableRenderer
                column={column}
                data={query.data.data ?? []}
                isFetching={query.isFetching}
                meta={query.data.meta}
                topics={topics}
              />
            )}
          </TableStateContext.Provider>
        </Stack>
      </UseQueryWrapperComponent>
    </Stack>
  );
}
