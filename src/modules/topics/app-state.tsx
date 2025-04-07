import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { TopicVisualizationMethod } from './results/topics';
import { TableStateType } from '../table/app-state';
import { useTableStateSetup } from '../table/context';

interface TopicAppStateContextType {
  topics: {
    topicVisualizationMethod: {
      state: TopicVisualizationMethod;
      setState: React.Dispatch<React.SetStateAction<TopicVisualizationMethod>>;
    };
  };
  documents: {
    params: TableStateType;
    topics: {
      state: number[];
      setState: React.Dispatch<React.SetStateAction<number[]>>;
    };
  };
}

const TopicAppStateContext = createContext<TopicAppStateContextType>(
  null as any,
);

export default function TopicAppStateProvider(props: React.PropsWithChildren) {
  const documentTableState = useTableStateSetup();
  const [topics, setTopics] = React.useState<number[]>([]);
  const [topicVisualizationMethod, setTopicVisualizationMethod] =
    React.useState<TopicVisualizationMethod>(
      TopicVisualizationMethod.InterTopicRelationship,
    );

  return (
    <TopicAppStateContext.Provider
      value={{
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
