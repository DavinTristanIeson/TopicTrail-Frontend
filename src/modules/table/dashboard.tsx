import { Stack } from '@mantine/core';
import { DashboardControls } from '../visualization/configuration/controls';
import { useTableAppState } from './app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';

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
  return (
    <Stack>
      <DashboardControls />
      <GridstackDashboard dashboard={dashboard} dashboardHandlers={handlers} />
    </Stack>
  );
}
