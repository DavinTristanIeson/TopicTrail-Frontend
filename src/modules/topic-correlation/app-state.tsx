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

interface TopicCorrelationAppStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  column: SchemaColumnModel | null;
  setColumn: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
  tab: TopicCorrelationPageTab;
  setTab: React.Dispatch<React.SetStateAction<TopicCorrelationPageTab>>;
  topics: TopicModel[] | null;
  setTopics: React.Dispatch<React.SetStateAction<TopicModel[] | null>>;
  visibility: Map<number, boolean>;
  setVisibility: React.Dispatch<React.SetStateAction<Map<number, boolean>>>;
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
  const [topics, setTopics] = React.useState<TopicModel[] | null>(null);
  const [visibility, setVisibility] = React.useState<Map<number, boolean>>(
    new Map(),
  );
  const { setState: setDashboard } = dashboardHandlers;

  React.useEffect(() => {
    setDashboard([]);
  }, [column, setDashboard]);

  const reset = React.useCallback(() => {
    setDashboard([]);
    setColumn(null);
    setTopics(null);
    setVisibility(new Map());
  }, [setDashboard, setTopics]);

  return (
    <TopicCorrelationAppStateContext.Provider
      value={{
        column,
        setColumn,
        tab,
        setTab,
        topics,
        setTopics,
        visibility,
        setVisibility,
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
    column?.name ?? '',
  );

  return { topicColumn, topicModelingResult };
}

export function useCheckTopicCorrelationTargetVisibility() {
  const visibility = useTopicCorrelationAppState((store) => store.visibility);
  const isVisible = React.useCallback(
    (id: number) => {
      return visibility.get(id) ?? true;
    },
    [visibility],
  );
  const isAllVisible = React.useCallback(
    (topics: TopicModel[]) => {
      return topics.every((topic) => isVisible(topic.id));
    },
    [isVisible],
  );
  const onlyVisible = React.useCallback(
    (topics: TopicModel[]) => {
      return topics.filter((topic) => isVisible(topic.id));
    },
    [isVisible],
  );
  return { isVisible, isAllVisible, onlyVisible };
}
export function useCheckTopicCorrelationTargetSpecificVisibility(id: number) {
  // more efficient than triggering a rerender for every visibility change
  const visible = useTopicCorrelationAppState(
    (store) => store.visibility.get(id) ?? true,
  );
  const setVisibility = useTopicCorrelationAppState(
    (store) => store.setVisibility,
  );
  const toggle = React.useCallback(() => {
    setVisibility((visibility) => {
      const newVisibility = new Map(visibility);
      newVisibility.set(id, !(visibility.get(id) ?? true));
      return newVisibility;
    });
  }, [id, setVisibility]);
  return { visible, toggle };
}
