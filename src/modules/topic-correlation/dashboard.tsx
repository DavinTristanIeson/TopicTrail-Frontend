import { Group, Stack } from '@mantine/core';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import { useTopicCorrelationAppState } from './app-state';
import { AddVisualizationConfigurationButton } from '../visualization/configuration/dialog';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

export default function TopicCorrelationDashboard() {
  const dashboard = useTopicCorrelationAppState(
    (store) => store.dashboard.state,
  );
  const handlers = useTopicCorrelationAppState(
    (store) => store.dashboard.handlers,
  );
  const { append } = handlers;
  return (
    <Stack>
      <Group justify="end">
        <AddVisualizationConfigurationButton onSubmit={append} />
      </Group>
      <GridstackDashboard dashboard={dashboard} dashboardHandlers={handlers} />
    </Stack>
  );
}
