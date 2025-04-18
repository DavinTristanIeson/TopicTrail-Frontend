import { Group, Stack } from '@mantine/core';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import { useTopicCorrelationAppState } from './app-state';
import {
  AddVisualizationConfigurationButton,
  DashboardResetButton,
} from '../visualization/dashboard/modals';
import { useTopicCorrelationDashboardDataManager } from '../userdata/data-manager';
import { useDashboardUserDataSharedBehavior } from '../table/dashboard';
import UserDataManager from '../userdata';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

function CorrelationDashboardUserDataManager() {
  const dashboard = useTopicCorrelationAppState(
    (store) => store.dashboard.state,
  );
  const handlers = useTopicCorrelationAppState(
    (store) => store.dashboard.handlers,
  );

  const rendererProps = useTopicCorrelationDashboardDataManager(
    useDashboardUserDataSharedBehavior(dashboard, handlers.setState),
  );
  return <UserDataManager {...rendererProps} label="Dashboard" />;
}

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
      <CorrelationDashboardUserDataManager />
      <Group justify="end">
        <DashboardResetButton onReset={() => handlers.setState([])} />
        <AddVisualizationConfigurationButton onSubmit={append} />
      </Group>
      <GridstackDashboard dashboard={dashboard} dashboardHandlers={handlers} />
    </Stack>
  );
}
