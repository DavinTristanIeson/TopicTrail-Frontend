import { DashboardControls } from '@/modules/visualization/configuration/controls';
import { Stack } from '@mantine/core';
import { useComparisonAppState } from '../app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';

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
  return (
    <Stack>
      <DashboardControls />
      <GridstackDashboard dashboard={dashboard} dashboardHandlers={handlers} />
    </Stack>
  );
}
