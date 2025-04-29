import {
  findProjectColumn,
  getTopicColumnName,
  SchemaColumnModel,
} from '@/api/project';
import { TopicModel } from '@/api/topic';
import { DashboardItemModel } from '@/api/userdata';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { ProjectContext } from '../project/context';
import { useTopicModelingResultOfColumn } from '../topics/components/context';

export enum TopicCorrelationPageTab {
  TopicsManager = 'topics-manager',
  Dashboard = 'dashboard',
}

export interface TopicCorrelationTopicItemModel {
  topic: TopicModel;
  visible: boolean;
}

interface TopicCorrelationAppStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  column: SchemaColumnModel | null;
  setColumn: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
  tab: TopicCorrelationPageTab;
  setTab: React.Dispatch<React.SetStateAction<TopicCorrelationPageTab>>;
  correlationTargets: TopicCorrelationTopicItemModel[] | null;
  setCorrelationTargets: React.Dispatch<
    React.SetStateAction<TopicCorrelationTopicItemModel[] | null>
  >;
  reset(): void;
}

const TopicCorrelationAppStateContext =
  createContext<TopicCorrelationAppStateContextType>(null as any);

export default function TopicCorrelationAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [column, setColumn] = React.useState<SchemaColumnModel | null>(null);
  const [tab, setTab] = React.useState<TopicCorrelationPageTab>(
    TopicCorrelationPageTab.TopicsManager,
  );
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);
  const [discriminators, setCorrelationTargets] = React.useState<
    TopicCorrelationTopicItemModel[] | null
  >(null);
  const { setState: setDashboard } = dashboardHandlers;

  React.useEffect(() => {
    setDashboard([]);
    setCorrelationTargets(null);
  }, [column, setDashboard, setCorrelationTargets]);

  const reset = React.useCallback(() => {
    setDashboard([]);
    setColumn(null);
    setCorrelationTargets(null);
  }, [setDashboard, setCorrelationTargets]);

  return (
    <TopicCorrelationAppStateContext.Provider
      value={{
        column,
        setColumn,
        tab,
        setTab,
        correlationTargets: discriminators,
        setCorrelationTargets: setCorrelationTargets,
        dashboard: {
          state: dashboard,
          handlers: dashboardHandlers,
        },
        reset,
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

export function useTopicCorrelationAppStateTopicColumn() {
  const project = React.useContext(ProjectContext);
  const column = useTopicCorrelationAppState((store) => store.column);
  const topicColumn = React.useMemo(() => {
    if (!column) return undefined;
    const topicColumnName = getTopicColumnName(column.name);
    return findProjectColumn(project, topicColumnName);
  }, [column, project]);

  const topicModelingResult = useTopicModelingResultOfColumn(
    topicColumn?.name ?? '',
  );

  return { topicColumn, topicModelingResult };
}
