import { Alert, Group, Stack } from '@mantine/core';
import {
  useCheckComparisonSubdatasetsVisibility,
  useComparisonAppState,
} from '../app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import {
  AddVisualizationConfigurationButton,
  DashboardResetButton,
} from '@/modules/visualization/dashboard/modals';
import {
  DashboardConstraintContext,
  DashboardSubdatasetsContext,
  DashboardSubdatasetsContextType,
} from '@/modules/visualization/types/context';
import UserDataManager from '@/modules/userdata';
import { useDashboardUserDataSharedBehavior } from '@/modules/table/dashboard';
import { useDashboardDataManager } from '@/modules/userdata/data-manager';
import { DashboardItemTypeEnum } from '@/modules/visualization/types/dashboard-item-types';
import React from 'react';
import { Warning } from '@phosphor-icons/react';

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

const COMPARISON_DASHBOARD_CONSTRAINT = {
  withoutTypes: [
    DashboardItemTypeEnum.BinaryStatisticTestOnContingencyTable,
    DashboardItemTypeEnum.BinaryStatisticTestOnDistribution,
    DashboardItemTypeEnum.ContingencyTable,
  ],
};

export default function ComparisonDashboard() {
  const dashboard = useComparisonAppState((store) => store.dashboard.state);
  const handlers = useComparisonAppState((store) => store.dashboard.handlers);
  const groups = useComparisonAppState((store) => store.groups.state);
  const includeWholeDataset = useComparisonAppState(
    (store) => store.groups.includeWholeDataset,
  );
  const { onlyVisible } = useCheckComparisonSubdatasetsVisibility();

  const dashboardSubdatasets =
    React.useMemo<DashboardSubdatasetsContextType>(() => {
      const defaultSubdatasets = onlyVisible(groups);
      if (includeWholeDataset) {
        defaultSubdatasets.unshift({
          name: 'Dataset',
          filter: null as any,
        });
      }
      return {
        default: defaultSubdatasets,
      };
    }, [groups, includeWholeDataset, onlyVisible]);
  const { append } = handlers;
  return (
    <DashboardSubdatasetsContext.Provider value={dashboardSubdatasets}>
      <DashboardConstraintContext.Provider
        value={COMPARISON_DASHBOARD_CONSTRAINT}
      >
        <Stack>
          <ComparisonDashboardUserDataManager />
          <Group justify="end">
            <DashboardResetButton onReset={() => handlers.setState([])} />
            <AddVisualizationConfigurationButton onSubmit={append} />
          </Group>
          {dashboardSubdatasets.default.length === 0 ? (
            <Alert color="yellow" icon={<Warning />}>
              Create at least one subdataset to be visualized from
              &quot;Subdatasets&quot; tab. If you have already prepared some
              subdatasets, make sure that at least one of them is visible in the
              &quot;Subdatasets&quot; tab.
            </Alert>
          ) : (
            <GridstackDashboard
              dashboard={dashboard}
              dashboardHandlers={handlers}
            />
          )}
        </Stack>
      </DashboardConstraintContext.Provider>
    </DashboardSubdatasetsContext.Provider>
  );
}
