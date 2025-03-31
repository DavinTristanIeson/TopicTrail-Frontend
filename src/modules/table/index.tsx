import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';
import TableRendererComponent from './table';
import { TableStateContext, useTableStateSetup } from './context';
import { Group, Stack, Title } from '@mantine/core';
import { TableSkeleton } from '@/components/visual/loading';
import { keepPreviousData } from '@tanstack/react-query';
import { TableFilterButton } from '../filter/drawer';
import FetchWrapperComponent from '@/components/utility/fetch-wrapper';

export default function TableQueryComponent() {
  const project = React.useContext(ProjectContext);
  const tableState = useTableStateSetup();
  const { limit, page, sort, filter } = tableState;
  const { data, error, isFetching, refetch } = client.useQuery(
    'post',
    '/table/{project_id}/',
    {
      params: {
        path: {
          project_id: project.id,
        },
      },
      body: {
        limit,
        page,
        sort,
        filter,
      },
    },
    {
      enabled: !!project,
      placeholderData: keepPreviousData,
    },
  );

  return (
    <TableStateContext.Provider value={tableState}>
      <Stack>
        <Group justify="space-between">
          <Title order={2}>Dataset of {project.config.metadata.name}</Title>
          <TableFilterButton />
        </Group>
        <FetchWrapperComponent
          isLoading={isFetching && !data}
          error={error}
          onRetry={refetch}
          loadingComponent={<TableSkeleton />}
        >
          {data && (
            <TableRendererComponent
              columns={data.columns}
              data={data.data}
              meta={data.meta}
              isFetching={isFetching}
            />
          )}
        </FetchWrapperComponent>
      </Stack>
    </TableStateContext.Provider>
  );
}
