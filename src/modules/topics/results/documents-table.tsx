import { client } from '@/common/api/client';
import {
  ProjectContext,
  useCurrentTextualColumn,
} from '@/modules/project/context';
import React from 'react';
import { TableFilterModel, TableSortModel } from '@/api/table';
import { DocumentPerTopicModel } from '@/api/topic';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TableSkeleton } from '@/components/visual/loading';
import TablePagination from '@/components/widgets/pagination';
import { Stack } from '@mantine/core';

interface DocumentsPerTopicTableRendererProps {
  data: DocumentPerTopicModel[];
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
}

function DocumentsPerTopicTableRenderer(
  props: DocumentsPerTopicTableRendererProps,
) {
  // TODO: Hansen
  return <></>;
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

  const [sort, setSort] = React.useState<TableSortModel | null>(null);
  const [page, setPage] = React.useState<number>(0);
  const [limit, setLimit] = React.useState<number>(25);

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

  // TODO: Hansen
  return (
    <UseQueryWrapperComponent
      query={query}
      loadingComponent={<TableSkeleton />}
    >
      <Stack>
        <DocumentsPerTopicTableRenderer
          data={query.data?.data ?? []}
          setSort={setSort}
          sort={sort}
        />
        {query.data?.meta && (
          <TablePagination
            setLimit={setLimit}
            setPage={setPage}
            limit={limit}
            page={page}
            meta={query.data?.meta}
          />
        )}
      </Stack>
    </UseQueryWrapperComponent>
  );
}
