import { Group, Stack } from '@mantine/core';
import { useTableAppState } from './app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import { AddVisualizationConfigurationButton } from '../visualization/dashboard/modals';
import { TableFilterButton } from '../filter/context';
import { DashboardGroupsContext } from '../visualization/types/context';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

export function TableDashboard() {
  const dashboard = useTableAppState((store) => store.dashboard.state);
  const handlers = useTableAppState((store) => store.dashboard.handlers);
  const { append } = handlers;
  const filter = useTableAppState((store) => store.params.filter);
  const setFilter = useTableAppState((store) => store.params.setFilter);
  return (
    <Stack>
      <Group justify="end">
        <TableFilterButton
          state={{
            filter,
            setFilter,
          }}
        />
        <AddVisualizationConfigurationButton onSubmit={append} />
      </Group>
      <DashboardGroupsContext.Provider
        value={[
          {
            name: 'Default',
            filter: filter!,
          },
        ]}
      >
        <GridstackDashboard
          dashboard={dashboard}
          dashboardHandlers={handlers}
        />
      </DashboardGroupsContext.Provider>
    </Stack>
  );
}
