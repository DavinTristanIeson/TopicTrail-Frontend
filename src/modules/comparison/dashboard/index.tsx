import { Group, Stack } from '@mantine/core';
import { useComparisonAppState } from '../app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import {
  AddVisualizationConfigurationButton,
  DashboardResetButton,
} from '@/modules/visualization/dashboard/modals';
import {
  DashboardConstraintContext,
  DashboardGroupsContext,
} from '@/modules/visualization/types/context';
import UserDataManager from '@/modules/userdata';
import { useDashboardUserDataSharedBehavior } from '@/modules/table/dashboard';
import { useDashboardDataManager } from '@/modules/userdata/data-manager';
import { DashboardItemTypeEnum } from '@/modules/visualization/types/dashboard-item-types';
import React from 'react';

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

  const rendererProps = useDashboardDataManager(
    useDashboardUserDataSharedBehavior({
      dashboard,
      setDashboard: handlers.setState,
    }),
  );
  return <UserDataManager {...rendererProps} label="Dashboard" />;
}

export default function ComparisonDashboard() {
  const dashboard = useComparisonAppState((store) => store.dashboard.state);
  const handlers = useComparisonAppState((store) => store.dashboard.handlers);
  const groups = useComparisonAppState((store) => store.groups.state);
  const visibleGroups = React.useMemo(
    () => groups.filter((group) => group.visible),
    [groups],
  );
  const { append } = handlers;
  return (
    <Stack>
      <ComparisonDashboardUserDataManager />
      <Group justify="end">
        <DashboardResetButton onReset={() => handlers.setState([])} />
        <AddVisualizationConfigurationButton onSubmit={append} />
      </Group>
      <DashboardGroupsContext.Provider value={visibleGroups}>
        <DashboardConstraintContext.Provider
          value={{
            withoutTypes: [
              DashboardItemTypeEnum.BinaryStatisticTestOnContingencyTable,
              DashboardItemTypeEnum.BinaryStatisticTestOnDistribution,
            ],
          }}
        >
          <GridstackDashboard
            dashboard={dashboard}
            dashboardHandlers={handlers}
          />
        </DashboardConstraintContext.Provider>
      </DashboardGroupsContext.Provider>
    </Stack>
  );
}
