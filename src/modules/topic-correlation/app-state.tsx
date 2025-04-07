import { DashboardItemModel } from '@/api/userdata';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

interface TopicCorrelationAppStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  params: {
    column1: string | null;
    column2: string | null;
    setColumn1: React.Dispatch<React.SetStateAction<string | null>>;
    setColumn2: React.Dispatch<React.SetStateAction<string | null>>;
  };
}

const TopicCorrelationAppStateContext =
  createContext<TopicCorrelationAppStateContextType>(null as any);

export default function TopicCorrelationAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [column1, setColumn1] = React.useState<string | null>(null);
  const [column2, setColumn2] = React.useState<string | null>(null);
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);

  return (
    <TopicCorrelationAppStateContext.Provider
      value={{
        params: {
          column1,
          column2,
          setColumn1,
          setColumn2,
        },
        dashboard: {
          state: dashboard,
          handlers: dashboardHandlers,
        },
      }}
    >
      {props.children}
    </TopicCorrelationAppStateContext.Provider>
  );
}

export function useTopicCorrelationAppState<T>(
  selector: (store: TopicCorrelationAppStateContextType) => T,
) {
  return useContextSelector(TopicCorrelationAppStateContext, selector);
}
