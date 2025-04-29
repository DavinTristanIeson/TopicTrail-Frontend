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

interface TopicCorrelationAppStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  column: SchemaColumnModel | null;
  setColumn: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
  topics: {
    state: TopicModel[];
    handlers: UseListStateHandlers<TopicModel>;
  };
  reset(): void;
}

const TopicCorrelationAppStateContext =
  createContext<TopicCorrelationAppStateContextType>(null as any);

export default function TopicCorrelationAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [column, setColumn] = React.useState<SchemaColumnModel | null>(null);
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);
  const [topics, topicHandlers] = useListState<TopicModel>([]);
  const { setState: setDashboard } = dashboardHandlers;
  const { setState: setTopics } = topicHandlers;

  React.useEffect(() => {
    setDashboard([]);
    setTopics([]);
  }, [column, setDashboard, setTopics]);

  const reset = React.useCallback(() => {
    setDashboard([]);
    setColumn(null);
    setTopics([]);
  }, [setDashboard, setTopics]);

  return (
    <TopicCorrelationAppStateContext.Provider
      value={{
        column,
        setColumn,
        topics: {
          state: topics,
          handlers: topicHandlers,
        },
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
