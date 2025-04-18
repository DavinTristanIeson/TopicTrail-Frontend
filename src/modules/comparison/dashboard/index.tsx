import { Group, Stack } from '@mantine/core';
import { useComparisonAppState } from '../app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import { AddVisualizationConfigurationButton } from '@/modules/visualization/dashboard/modals';
import { DashboardGroupsContext } from '@/modules/visualization/types/context';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

export default function ComparisonDashboard() {
  const dashboard = useComparisonAppState((store) => store.dashboard.state);
  const handlers = useComparisonAppState((store) => store.dashboard.handlers);
  const groups = useComparisonAppState((store) => store.groups.state);
  const { append } = handlers;
  return (
    <Stack>
      <Group justify="end">
        <AddVisualizationConfigurationButton onSubmit={append} />
      </Group>
      <DashboardGroupsContext.Provider value={groups}>
        <GridstackDashboard
          dashboard={dashboard}
          dashboardHandlers={handlers}
        />
      </DashboardGroupsContext.Provider>
    </Stack>
  );
}
