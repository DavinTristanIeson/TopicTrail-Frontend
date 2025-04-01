import { client } from '@/common/api/client';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TableSkeleton } from '@/components/visual/loading';
import { TableFilterButton } from '@/modules/filter/drawer';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import { FilterStateContext } from '@/modules/table/context';
import { Group } from '@mantine/core';
import React from 'react';

export function TopicWordsVisualization() {
  const project = React.useContext(ProjectContext);
  const column = React.useContext(SchemaColumnContext);
  const { filter, setFilter } = React.useContext(FilterStateContext);
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
        <></>
      </UseQueryWrapperComponent>
    </FilterStateContext.Provider>
  );
}
