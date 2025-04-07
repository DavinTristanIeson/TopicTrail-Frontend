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
  params: {
    column1: SchemaColumnModel | null;
    column2: SchemaColumnModel | null;
    setColumn2: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
    setColumn1: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
  };
}

const TopicCorrelationAppStateContext =
  createContext<TopicCorrelationAppStateContextType>(null as any);

export default function TopicCorrelationAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [column1, setColumn1] = React.useState<SchemaColumnModel | null>(null);
  const [column2, setColumn2] = React.useState<SchemaColumnModel | null>(null);
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
