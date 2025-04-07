import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { TopicVisualizationMethodEnum } from './results/topics';
import { useTableStateSetup, TableStateType } from '../table/app-state';
import { TopicModel } from '@/api/topic';
import { TopicsPageTab } from './results';

interface TopicAppStateContextType {
  column: {
    state: string | null;
    setState: React.Dispatch<React.SetStateAction<string | null>>;
  };
  tab: {
    state: TopicsPageTab;
    setState: React.Dispatch<React.SetStateAction<TopicsPageTab>>;
  };
  topics: {
    topicVisualizationMethod: {
      state: TopicVisualizationMethodEnum;
      setState: React.Dispatch<
        React.SetStateAction<TopicVisualizationMethodEnum>
      >;
    };
  };
  documents: {
    params: TableStateType;
    topics: {
      state: TopicModel[];
      setState: React.Dispatch<React.SetStateAction<TopicModel[]>>;
    };
  };
}

const TopicAppStateContext = createContext<TopicAppStateContextType>(
  null as any,
);

export default function TopicAppStateProvider(props: React.PropsWithChildren) {
  const documentTableState = useTableStateSetup();
  const [column, setColumn] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<TopicsPageTab>(TopicsPageTab.Topics);
  const [topics, setTopics] = React.useState<TopicModel[]>([]);
  const [topicVisualizationMethod, setTopicVisualizationMethod] =
    React.useState<TopicVisualizationMethodEnum>(
      TopicVisualizationMethodEnum.InterTopicRelationship,
    );

  React.useEffect(() => {
    setTopics([]);
  }, [column]);

  return (
    <TopicAppStateContext.Provider
      value={{
        column: {
          state: column,
          setState: setColumn,
        },
        tab: {
          state: tab,
          setState: setTab,
        },
        topics: {
          topicVisualizationMethod: {
            state: topicVisualizationMethod,
            setState: setTopicVisualizationMethod,
          },
        },
        documents: {
          params: documentTableState,
          topics: {
            state: topics,
            setState: setTopics,
          },
        },
      }}
    >
      {props.children}
    </TopicAppStateContext.Provider>
  );
}

export function useTopicAppState<T>(
  selector: (store: TopicAppStateContextType) => T,
) {
  return useContextSelector(TopicAppStateContext, selector);
}
