import { ComparisonStateItemModel } from '@/api/comparison';
import { DashboardItemModel } from '@/api/userdata';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export enum ComparisonPageTab {
  GroupsManager = 'group-manager',
  Visualization = 'visualization',
  StatisticTest = 'statistic-test',
}

interface ComparisonAppStateContextType {
  tab: ComparisonPageTab;
  setTab: React.Dispatch<React.SetStateAction<ComparisonPageTab>>;
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  groups: {
    state: ComparisonStateItemModel[];
    handlers: UseListStateHandlers<ComparisonStateItemModel>;
  };
  reset(): void;
}

const ComparisonAppStateContext = createContext<ComparisonAppStateContextType>(
  null as any,
);

export default function ComparisonAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [tab, setTab] = React.useState(ComparisonPageTab.GroupsManager);
  const [groups, groupHandlers] = useListState<ComparisonStateItemModel>();
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);

  React.useEffect(() => {
    setTab(ComparisonPageTab.GroupsManager);
  }, [groups]);

  const { setState: setGroups } = groupHandlers;
  const { setState: setDashboard } = groupHandlers;

  const reset = React.useCallback(() => {
    setGroups([]);
    setDashboard([]);
  }, [setDashboard, setGroups]);

  return (
    <ComparisonAppStateContext.Provider
      value={{
        tab,
        setTab,
        groups: {
          state: groups,
          handlers: groupHandlers,
        },
        dashboard: {
          state: dashboard,
          handlers: dashboardHandlers,
        },
        reset,
      }}
    >
      {props.children}
    </ComparisonAppStateContext.Provider>
  );
}

export function useComparisonAppState<T>(
  selector: (store: ComparisonAppStateContextType) => T,
) {
  return useContextSelector(ComparisonAppStateContext, selector);
}
