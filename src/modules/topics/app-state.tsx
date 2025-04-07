import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { TopicVisualizationMethodEnum } from './results/topics';
import { useTableStateSetup, TableStateType } from '../table/app-state';

interface TopicAppStateContextType {
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
    React.useState<TopicVisualizationMethodEnum>(
      TopicVisualizationMethodEnum.InterTopicRelationship,
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
