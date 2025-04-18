import { Group, Stack } from '@mantine/core';
import { useComparisonAppState } from '../app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import {
  AddVisualizationConfigurationButton,
  DashboardResetButton,
} from '@/modules/visualization/dashboard/modals';
import { DashboardGroupsContext } from '@/modules/visualization/types/context';
import { useComparisonDashboardDataManager } from '@/modules/userdata/data-manager';
import UserDataManager from '@/modules/userdata';
import { useDashboardUserDataSharedBehavior } from '@/modules/table/dashboard';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

function ComparisonDashboardUserDataManager() {
  const dashboard = useComparisonAppState((store) => store.dashboard.state);
  const handlers = useComparisonAppState((store) => store.dashboard.handlers);

  const rendererProps = useComparisonDashboardDataManager(
    useDashboardUserDataSharedBehavior(dashboard, handlers.setState),
  );
  return <UserDataManager {...rendererProps} label="Dashboard" />;
}

export default function ComparisonDashboard() {
  const dashboard = useComparisonAppState((store) => store.dashboard.state);
  const handlers = useComparisonAppState((store) => store.dashboard.handlers);
  const groups = useComparisonAppState((store) => store.groups.state);
  const { append } = handlers;
  return (
    <Stack>
      <ComparisonDashboardUserDataManager />
      <Group justify="end">
        <DashboardResetButton onReset={() => handlers.setState([])} />
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
