import { ComparisonStateItemModel } from '@/api/comparison';
import { DashboardItemModel } from '@/api/userdata';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { StatisticalAnalysisStateItem } from '../statistical-analysis/types';
import { isEqual } from 'lodash-es';

export enum ComparisonPageTab {
  GroupsManager = 'group-manager',
  Visualization = 'visualization',
  StatisticalAnalysis = 'statistical-analysis',
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
    includeAntiSubdataset: boolean;
    setIncludeAntiSubdataset: React.Dispatch<React.SetStateAction<boolean>>;
  };
  statisticalAnalysis: {
    input: StatisticalAnalysisStateItem | null;
    setInput: (state: StatisticalAnalysisStateItem | null) => void;
    history: StatisticalAnalysisStateItem[];
    reset(): void;
  };
  reset(): void;
}

const ComparisonAppStateContext = createContext<ComparisonAppStateContextType>(
  null as any,
);

const STATISTICAL_ANALYSIS_HISTORY_LIMIT = 100;
function useComparisonStatisticalAnalysisAppState() {
  const [history, setHistory] = React.useState<StatisticalAnalysisStateItem[]>(
    [],
  );
  const statisticalAnalysisInput =
    history.length === 0 ? null : history[history.length - 1]!;
  const setStatisticalAnalysisInput = React.useCallback(
    (newEntry: StatisticalAnalysisStateItem | null) => {
      if (newEntry == null) return;
      setHistory((prev) => {
        let history = prev.filter((entry) => !isEqual(entry, newEntry));
        history.push(newEntry);

        if (history.length > STATISTICAL_ANALYSIS_HISTORY_LIMIT) {
          history = history.slice(
            history.length - STATISTICAL_ANALYSIS_HISTORY_LIMIT,
          );
        }
        return history;
      });
    },
    [],
  );
  const reset = React.useCallback(() => {
    setHistory([]);
    setStatisticalAnalysisInput(null);
  }, [setStatisticalAnalysisInput]);

  return {
    input: statisticalAnalysisInput,
    setInput: setStatisticalAnalysisInput,
    history,
    setHistory,
    reset,
  };
}

export default function ComparisonAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [tab, setTab] = React.useState(ComparisonPageTab.GroupsManager);
  const [groups, groupHandlers] = useListState<ComparisonStateItemModel>();
  // Visibility is decoupled from the comparison groups themselves.
  // This makes state management a lot more complex; but it makes updating visibility more efficient if you have a lot of groups.
  // ...not like you should have a lot of groups anyway.
  const [groupVisibility, setGroupVisibility] = React.useState<
    Map<string, boolean>
  >(new Map());
  const [includeWholeDataset, setIncludeWholeDataset] =
    React.useState<boolean>(false);
  const [includeAntiSubdataset, setIncludeAntiSubdataset] =
    React.useState<boolean>(false);
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);

  React.useEffect(() => {
    setTab(ComparisonPageTab.GroupsManager);
  }, [groups]);

  const { setState: setGroups } = groupHandlers;
  const { setState: setDashboard } = dashboardHandlers;

  const statisticTest = useComparisonStatisticalAnalysisAppState();
  const { reset: resetStatisticalAnalysis } = statisticTest;

  const reset = React.useCallback(() => {
    setGroups([]);
    setDashboard([]);
    setGroupVisibility(new Map());
    resetStatisticalAnalysis();
  }, [resetStatisticalAnalysis, setDashboard, setGroups]);

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
          includeAntiSubdataset,
          setIncludeAntiSubdataset,
        },
        dashboard: {
          state: dashboard,
          handlers: dashboardHandlers,
        },
        statisticalAnalysis: statisticTest,
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
  const includeWholeDataset = useComparisonAppState(
    (store) => store.groups.includeWholeDataset,
  );
  const includeAntiSubdataset = useComparisonAppState(
    (store) => store.groups.includeAntiSubdataset,
  );
  return React.useMemo((): ComparisonStateItemModel[] => {
    const subdatasets = onlyVisible(comparisonGroups);
    if (includeWholeDataset) {
      subdatasets.push({
        name: 'Dataset',
        filter: null,
        internal: true,
      } as any);
    }
    if (includeAntiSubdataset) {
      subdatasets.push({
        name: 'Other',
        filter: {
          type: 'not',
          operand: {
            type: 'or',
            operands: comparisonGroups.map((group) => group.filter),
          },
        },
        internal: true,
      } as any);
    }
    return subdatasets;
  }, [
    comparisonGroups,
    includeAntiSubdataset,
    includeWholeDataset,
    onlyVisible,
  ]);
}
