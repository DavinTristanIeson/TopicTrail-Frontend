import { client } from '@/common/api/client';
import {
  ProjectContext,
  useCurrentTextualColumn,
} from '@/modules/project/context';
import React, { useMemo } from 'react';
import { PaginationMetaModel, TableFilterModel } from '@/api/table';
import { DocumentPerTopicModel } from '@/api/topic';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TableSkeleton } from '@/components/visual/loading';
import { Stack } from '@mantine/core';
import { TableStateContext, useTableStateSetup } from '@/modules/table/context';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import {
  MantineReactTableBehaviors,
  useTableStateToMantineReactTableAdapter,
} from '@/modules/table/adapter';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import { getTopicColumnName, TextualSchemaColumnModel } from '@/api/project';
import { keepPreviousData } from '@tanstack/react-query';
import { TextualColumnCell, TopicColumnCell } from '@/modules/table/cell';

interface DocumentsPerTopicTableRendererProps {
  data: DocumentPerTopicModel[];
  meta: PaginationMetaModel;
  isFetching: boolean;
  column: TextualSchemaColumnModel;
}

function DocumentsPerTopicTableRenderer(
  props: DocumentsPerTopicTableRendererProps,
) {
  const { data, meta, column, isFetching } = props;
  const tableColumns = useMemo<MRT_ColumnDef<DocumentPerTopicModel>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
      },
      {
        accessorKey: 'original',
        header: 'Original Text',
        size: 400,
        Cell({ row: { original } }) {
          return <TextualColumnCell>{original.original}</TextualColumnCell>;
        },
      },
      {
        accessorKey: 'preprocessed',
        header: 'Preprocessed Text',
        size: 400,
        Cell({ row: { original } }) {
          return <TextualColumnCell>{original.preprocessed}</TextualColumnCell>;
        },
      },
      {
        accessorKey: 'topic',
        header: 'Topic',
        size: 250,
        Cell({ row: { original } }) {
          return (
            <TopicColumnCell column={column.name} topic={original.topic} />
          );
        },
      },
    ],
    [column],
  );

  const tableProps = useTableStateToMantineReactTableAdapter({
    meta,
    isFetching,
  });

  const table = useMantineReactTable<DocumentPerTopicModel>({
    data,
    columns: tableColumns,
    ...tableProps,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    ...MantineReactTableBehaviors.Virtualized(data, tableColumns),
  });

  return <MantineReactTable table={table} />;
}

interface DocumentsPerTopicTableProps {
  topicIds: number[];
}

export default function DocumentsPerTopicTable(
  props: DocumentsPerTopicTableProps,
) {
  const { topicIds } = props;
  const project = React.useContext(ProjectContext);
  const column = useCurrentTextualColumn();

  const tableState = useTableStateSetup();
  const { page, limit, sort, filter } = tableState;

  const topicsFilter: TableFilterModel | undefined =
    topicIds.length > 0
      ? {
          type: TableFilterTypeEnum.IsOneOf,
          target: getTopicColumnName(column.name),
          values: topicIds,
        }
      : undefined;

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
        filter: {
          type: TableFilterTypeEnum.And,
          operands: [filter!, topicsFilter!].filter(Boolean),
        },
      },
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  return (
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
            />
          )}
        </TableStateContext.Provider>
      </Stack>
    </UseQueryWrapperComponent>
  );
}
