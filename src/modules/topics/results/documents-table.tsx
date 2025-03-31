import { client } from '@/common/api/client';
import {
  ProjectContext,
  useCurrentTextualColumn,
} from '@/modules/project/context';
import React, { useMemo, useContext } from 'react';
import { TableFilterModel } from '@/api/table';
import { DocumentPerTopicModel } from '@/api/topic';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TableSkeleton } from '@/components/visual/loading';
import { Stack } from '@mantine/core';
import { TableStateContext, useTableStateSetup } from '@/modules/table/context';
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';

interface DocumentsPerTopicTableRendererProps {
  data: DocumentPerTopicModel[];
}

function DocumentsPerTopicTableRenderer(
  props: DocumentsPerTopicTableRendererProps,
) {
  const { data } = props;
  const tableColumns = useMemo<MRT_ColumnDef<Record<string, any>>[]>(() => [
    {
      accessorKey: 'id',
      header: 'Document ID',
    },
    {
      accessorKey: 'original',
      header: 'Original Text',
    },
    {
      accessorKey: 'preprocessed',
      header: 'Preprocessed Text',
    },
    {
      accessorKey: 'topic',
      header: 'Topic',
    },
  ], []);

  const table = useMantineReactTable({
    data,
    columns: tableColumns,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    ...MantineReactTableBehaviors.Virtualized(data, tableColumns),
  });

  return <MantineReactTable table={table} layoutMode={'grid-no-grow' as any} />;
}

interface DocumentsPerTopicTableProps {
  topic: number;
  filter: TableFilterModel | null;
}

export default function DocumentsPerTopicTable(
  props: DocumentsPerTopicTableProps,
) {
  const { topic, filter } = props;
  const project = React.useContext(ProjectContext);
  const column = useCurrentTextualColumn();

  const tableState = useTableStateSetup();
  const { page, limit, sort } = tableState;

  const query = client.useQuery('post', '/topics/{project_id}/documents', {
    params: {
      query: {
        column: column.name,
        topic,
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
  });

  return (
    <UseQueryWrapperComponent
      query={query}
      loadingComponent={<TableSkeleton />}
    >
      <Stack>
        <TableStateContext.Provider value={tableState}>
          <DocumentsPerTopicTableRenderer data={query.data?.data ?? []} />
        </TableStateContext.Provider>
      </Stack>
    </UseQueryWrapperComponent>
  );
}
