import { Group, Stack } from '@mantine/core';
import { useTableAppState } from './app-state';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import {
  AddVisualizationConfigurationButton,
  DashboardResetButton,
} from '../visualization/dashboard/modals';
import { TableFilterButton } from '../filter/context';
import { DashboardGroupsContext } from '../visualization/types/context';
import UserDataManager from '../userdata';
import React from 'react';
import { DashboardItemModel, DashboardModel } from '@/api/userdata';
import { useDashboardDataManager } from '../userdata/data-manager';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

interface UseDashboardUserDataSharedBehaviorParams {
  dashboard: DashboardItemModel[];
  setDashboard: (dashboard: DashboardItemModel[]) => void;
}
export function useDashboardUserDataSharedBehavior(
  props: UseDashboardUserDataSharedBehaviorParams,
) {
  const { dashboard, setDashboard } = props;
  return {
    state:
      dashboard.length > 0
        ? ({
            items: dashboard,
          } as DashboardModel)
        : null,
    onApply: React.useCallback(
      (state: DashboardModel) => {
        setDashboard(state.items as DashboardItemModel[]);
      },
      [setDashboard],
    ),
  };
}

function TableDashboardUserDataManager() {
  const dashboard = useTableAppState((store) => store.dashboard.state);
  const handlers = useTableAppState((store) => store.dashboard.handlers);

  const rendererProps = useDashboardDataManager(
    useDashboardUserDataSharedBehavior({
      dashboard,
      setDashboard: handlers.setState,
    }),
  );
  return <UserDataManager {...rendererProps} label="Dashboard" />;
}

export function TableDashboard() {
  const dashboard = useTableAppState((store) => store.dashboard.state);
  const handlers = useTableAppState((store) => store.dashboard.handlers);
  const { append, setState: setDashboard } = handlers;
  const filter = useTableAppState((store) => store.params.filter);
  const setFilter = useTableAppState((store) => store.params.setFilter);
  return (
    <Stack>
      <TableDashboardUserDataManager />
      <Group justify="end">
        <DashboardResetButton onReset={() => setDashboard([])} />
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
