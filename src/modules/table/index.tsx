import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';
import TableRendererComponent from './table';
import { TableStateContext, useTableStateSetup } from './context';
import { Funnel, Warning } from '@phosphor-icons/react';
import { Alert, Button, Group, Indicator, Stack } from '@mantine/core';
import { TableSkeleton } from '@/components/visual/loading';
import { keepPreviousData } from '@tanstack/react-query';
import { DisclosureTrigger } from '@/hooks/disclosure';
import TableFilterDrawer from '../filter/drawer';

function TableFilterButton() {
  const tableFilterRemote = React.useRef<DisclosureTrigger | null>(null);
  const { filter, setFilter } = React.useContext(TableStateContext);
  return (
    <Indicator disabled={!filter} color="red" zIndex={2}>
      <TableFilterDrawer
        ref={tableFilterRemote}
        filter={filter}
        setFilter={setFilter}
      />
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
  );
}

export default function TableQueryComponent() {
  const project = React.useContext(ProjectContext);
  const tableState = useTableStateSetup();
  const { limit, page, sort, filter } = tableState;
  const { data, error, isFetching } = client.useQuery(
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

  const errorComponent = error && (
    <Alert
      variant="red"
      icon={<Warning size={20} />}
      title="An error has occurred while loading the dataset"
    >
      {error.message}
    </Alert>
  );

  if (error && !data) {
    return errorComponent;
  }

  if (!data) {
    return <TableSkeleton />;
  }

  return (
    <TableStateContext.Provider value={tableState}>
      <Stack>
        {errorComponent}
        <Group justify="end">
          <TableFilterButton />
        </Group>
        <TableRendererComponent
          columns={data.columns}
          data={data.data}
          meta={data.meta}
          isFetching={isFetching}
        />
      </Stack>
    </TableStateContext.Provider>
  );
}
