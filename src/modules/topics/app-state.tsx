import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { TopicVisualizationMethodEnum } from './results/topics';
import { useTableStateSetup, TableStateType } from '../table/app-state';
import { TopicModel } from '@/api/topic';
import { TopicsPageTab } from './results';
import { useNestedState } from '@/hooks/nested';

interface TopicModelingOptionsData {
  shouldUseCachedPreprocessedDocuments: boolean;
  shouldUseCachedUMAPVectors: boolean;
  shouldUseCachedDocumentVectors: boolean;
}

interface TopicAppStateContextType {
  column: string | null;
  setColumn: React.Dispatch<React.SetStateAction<string | null>>;

  tab: TopicsPageTab;
  setTab: React.Dispatch<React.SetStateAction<TopicsPageTab>>;

  topics: {
    topicVisualizationMethod: TopicVisualizationMethodEnum;
    setTopicVisualizationMethod: React.Dispatch<
      React.SetStateAction<TopicVisualizationMethodEnum>
    >;
  };
  documents: {
    params: TableStateType;
    topics: TopicModel[];
    setTopics: React.Dispatch<React.SetStateAction<TopicModel[]>>;
  };
  topicModelingOptions: {
    state: Record<string, TopicModelingOptionsData>;
    current: TopicModelingOptionsData;
    setState(
      key: string,
      options: React.SetStateAction<TopicModelingOptionsData>,
    ): void;
    setCurrent(options: React.SetStateAction<TopicModelingOptionsData>): void;
    resetCurrent(): void;
  };
}

const defaultTopicModelingOptions = () =>
  ({
    shouldUseCachedDocumentVectors: true,
    shouldUseCachedPreprocessedDocuments: true,
    shouldUseCachedUMAPVectors: true,
  }) as TopicModelingOptionsData;

function useTopicModelingOptionsAppState(
  column: string | null,
): TopicAppStateContextType['topicModelingOptions'] {
  const [state, setState] = React.useState<
    Record<string, TopicModelingOptionsData>
  >({});
  const {
    get: getNested,
    set: setNested,
    reset: resetNested,
  } = useNestedState({
    defaultFactory: defaultTopicModelingOptions,
    setState,
    state,
  });
  return {
    current: getNested(column ?? ''),
    resetCurrent: React.useCallback(() => {
      if (!column) return;
      resetNested(column);
    }, [column, resetNested]),
    setState: setNested,
    setCurrent: React.useCallback(
      (value: TopicModelingOptionsData) => {
        if (!column) return;
        setNested(column, value);
      },
      [column, setNested],
    ),
    state,
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

  const topicModelingOptions = useTopicModelingOptionsAppState(column);

  const { reset } = documentTableState;
  React.useEffect(() => {
    setTopics([]);
    reset();
  }, [column, reset]);

  return (
    <TopicAppStateContext.Provider
      value={{
        column,
        setColumn,
        tab,
        setTab,
        topics: {
          topicVisualizationMethod,
          setTopicVisualizationMethod,
        },
        documents: {
          params: documentTableState,
          topics,
          setTopics,
        },
        topicModelingOptions,
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
