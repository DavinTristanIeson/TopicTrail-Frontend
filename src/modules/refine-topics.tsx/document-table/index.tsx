import { TopicModel } from '@/api/topic';
import React from 'react';
import { TextualSchemaColumnModel } from '@/api/project';
import { TableStateContext, useTableStateSetup } from '@/modules/table/context';
import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import { RefineTopicsDocumentTableRenderer } from './renderer';
import FetchWrapperComponent from '@/components/utility/fetch-wrapper';
import { TableSkeleton } from '@/components/visual/loading';
import { keepPreviousData } from '@tanstack/react-query';

interface RefineTopicsDocumentTableProps {
  column: TextualSchemaColumnModel;
  topics: TopicModel[];
}

export function RefineTopicsDocumentTable(
  props: RefineTopicsDocumentTableProps,
) {
  const { column, topics } = props;
  const project = React.useContext(ProjectContext);

  const tableState = useTableStateSetup();
  const { page, limit, filter, sort } = tableState;

  const { data, isFetching, error, refetch } = client.useQuery(
    'post',
    '/topic/{project_id}/documents',
    {
      body: {
        page,
        limit,
        filter,
        sort,
      },
      params: {
        path: {
          project_id: project.id,
        },
        query: {
          column: column.name,
        },
      },
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  return (
    <TableStateContext.Provider value={tableState}>
      <FetchWrapperComponent
        error={error}
        onRetry={refetch}
        isLoading={isFetching && !data}
        loadingComponent={<TableSkeleton />}
      >
        {data && (
          <RefineTopicsDocumentTableRenderer
            topics={topics}
            data={data.data}
            meta={data.meta}
            isFetching={isFetching}
            column={column}
          />
        )}
      </FetchWrapperComponent>
    </TableStateContext.Provider>
  );
}
