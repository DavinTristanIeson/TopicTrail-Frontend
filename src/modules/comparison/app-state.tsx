import { ComparisonStateItemModel } from '@/api/comparison';
import { DashboardItemModel } from '@/api/userdata';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { StatisticTestHistoryEntry } from '../statistic-test/types';

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
    visibility: Map<string, boolean>;
    setVisibility: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
    includeWholeDataset: boolean;
    setIncludeWholeDataset: React.Dispatch<React.SetStateAction<boolean>>;
  };
  statisticTest: {
    current: StatisticTestHistoryEntry | null;
    setCurrent: React.Dispatch<
      React.SetStateAction<StatisticTestHistoryEntry | null>
    >;

    history: StatisticTestHistoryEntry[];
    historyHandlers: UseListStateHandlers<StatisticTestHistoryEntry>;
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
  const [groupVisibility, setGroupVisibility] = React.useState<
    Map<string, boolean>
  >(new Map());
  const [includeWholeDataset, setIncludeWholeDataset] =
    React.useState<boolean>(false);
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);

  const [currentStatisticTestEntry, setCurrentStatisticTestEntry] =
    React.useState<StatisticTestHistoryEntry | null>(null);
  const [history, historyHandlers] = useListState<StatisticTestHistoryEntry>(
    [],
  );

  React.useEffect(() => {
    setTab(ComparisonPageTab.GroupsManager);
  }, [groups]);

  const { setState: setGroups } = groupHandlers;
  const { setState: setDashboard } = dashboardHandlers;
  const { setState: setHistory } = historyHandlers;

  const reset = React.useCallback(() => {
    setGroups([]);
    setDashboard([]);
    setGroupVisibility(new Map());
    setCurrentStatisticTestEntry(null);
    setHistory([]);
  }, [setDashboard, setGroups, setHistory]);

  return (
    <ComparisonAppStateContext.Provider
      value={{
        tab,
        setTab,
        groups: {
          visibility: groupVisibility,
          setVisibility: setGroupVisibility,
          state: groups,
          handlers: groupHandlers,
          includeWholeDataset,
          setIncludeWholeDataset,
        },
        dashboard: {
          state: dashboard,
          handlers: dashboardHandlers,
        },
        statisticTest: {
          current: currentStatisticTestEntry,
          setCurrent: setCurrentStatisticTestEntry,
          history,
          historyHandlers,
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

export function useCheckComparisonSubdatasetsVisibility() {
  const visibility = useComparisonAppState((store) => store.groups.visibility);
  const setVisibilityAll = useComparisonAppState(
    (store) => store.groups.setVisibility,
  );
  const isVisible = React.useCallback(
    (name: string) => {
      return visibility.get(name) ?? true;
    },
    [visibility],
  );
  const isAllVisible = React.useCallback(
    (subdatasets: ComparisonStateItemModel[]) => {
      return subdatasets.every((subdataset) => isVisible(subdataset.name));
    },
    [isVisible],
  );
  const onlyVisible = React.useCallback(
    (subdatasets: ComparisonStateItemModel[]) => {
      return subdatasets.filter((subdataset) => isVisible(subdataset.name));
    },
    [isVisible],
  );
  const setVisibility = React.useCallback(
    (name: string, value: boolean) => {
      setVisibilityAll((visibility) => {
        const newVisibility = new Map(visibility);
        newVisibility.set(name, value);
        return newVisibility;
      });
    },
    [setVisibilityAll],
  );
  return { isVisible, isAllVisible, onlyVisible, setVisibility };
}

export function useCheckComparisonSubdatasetsSpecificVisibility(name: string) {
  // more efficient than triggering a rerender for every visibility change
  const visible = useComparisonAppState(
    (store) => store.groups.visibility.get(name) ?? true,
  );
  const setVisibility = useComparisonAppState(
    (store) => store.groups.setVisibility,
  );
  const toggle = React.useCallback(() => {
    setVisibility((visibility) => {
      const newVisibility = new Map(visibility);
      newVisibility.set(name, !(visibility.get(name) ?? true));
      return newVisibility;
    });
  }, [name, setVisibility]);
  return { visible, toggle };
}

export function useVisibleComparisonGroups() {
  const { onlyVisible } = useCheckComparisonSubdatasetsVisibility();
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  return React.useMemo(
    () => onlyVisible(comparisonGroups),
    [comparisonGroups, onlyVisible],
  );
}
