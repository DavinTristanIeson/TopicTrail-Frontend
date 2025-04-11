import { SchemaColumnModel } from '@/api/project';
import { DashboardItemModel } from '@/api/userdata';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

interface TopicCorrelationAppStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  column: SchemaColumnModel | null;
  setColumn: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
}

const TopicCorrelationAppStateContext =
  createContext<TopicCorrelationAppStateContextType>(null as any);

export default function TopicCorrelationAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [column, setColumn] = React.useState<SchemaColumnModel | null>(null);
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);
  const { setState } = dashboardHandlers;

  React.useEffect(() => {
    setState([]);
  }, [column, setState]);

  return (
    <TopicCorrelationAppStateContext.Provider
      value={{
        column,
        setColumn,
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
