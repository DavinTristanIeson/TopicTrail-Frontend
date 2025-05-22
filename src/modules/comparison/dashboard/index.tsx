import { Alert, Group, Stack } from '@mantine/core';
import {
  useComparisonAppState,
  useVisibleComparisonGroups,
} from '../app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import {
  AddVisualizationConfigurationButton,
  DashboardResetButton,
} from '@/modules/visualization/dashboard/modals';
import {
  DashboardSubdatasetsContext,
  DashboardSubdatasetsContextType,
} from '@/modules/visualization/types/context';
import UserDataManager from '@/modules/userdata';
import { useDashboardUserDataSharedBehavior } from '@/modules/table/dashboard';
import { useDashboardDataManager } from '@/modules/userdata/data-manager';
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

export default function ComparisonDashboard() {
  const dashboard = useComparisonAppState((store) => store.dashboard.state);
  const handlers = useComparisonAppState((store) => store.dashboard.handlers);
  const includeWholeDataset = useComparisonAppState(
    (store) => store.groups.includeWholeDataset,
  );
  const groups = useVisibleComparisonGroups();

  const dashboardSubdatasets =
    React.useMemo<DashboardSubdatasetsContextType>(() => {
      const defaultSubdatasets = groups;
      if (includeWholeDataset) {
        defaultSubdatasets.unshift({
          name: 'Dataset',
          filter: null as any,
        });
      }
      return {
        default: defaultSubdatasets,
      };
    }, [groups, includeWholeDataset]);
  const { append } = handlers;
  return (
    <DashboardSubdatasetsContext.Provider value={dashboardSubdatasets}>
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
    </DashboardSubdatasetsContext.Provider>
  );
}
