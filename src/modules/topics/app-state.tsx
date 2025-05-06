import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { TopicVisualizationMethodEnum } from './results/topics';
import { useTableStateSetup, TableStateType } from '../table/app-state';
import { TopicModel } from '@/api/topic';
import { TopicsPageTab } from './results';
import { useNestedState } from '@/hooks/nested';
import { TextualSchemaColumnModel } from '@/api/project';
import { useTopicModelingResultOfColumn } from './components/context';

interface TopicModelingOptionsData {
  shouldUseCachedPreprocessedDocuments: boolean;
  shouldUseCachedUMAPVectors: boolean;
  shouldUseCachedDocumentVectors: boolean;
}

interface TopicAppStateContextType {
  column: TextualSchemaColumnModel | null;
  setColumn: React.Dispatch<
    React.SetStateAction<TextualSchemaColumnModel | null>
  >;

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
    reset(): void;
    setCurrent(options: React.SetStateAction<TopicModelingOptionsData>): void;
    resetCurrent(): void;
  };
  reset(): void;
}

const defaultTopicModelingOptions = () =>
  ({
    shouldUseCachedDocumentVectors: true,
    shouldUseCachedPreprocessedDocuments: true,
    shouldUseCachedUMAPVectors: true,
  }) as TopicModelingOptionsData;

function useTopicModelingOptionsAppState(
  column: string | null | undefined,
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
    reset: React.useCallback(() => {
      setState({});
    }, []),
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
  const [column, setColumn] = React.useState<TextualSchemaColumnModel | null>(
    null,
  );
  const [tab, setTab] = React.useState<TopicsPageTab>(TopicsPageTab.Topics);
  const [topics, setTopics] = React.useState<TopicModel[]>([]);
  const [topicVisualizationMethod, setTopicVisualizationMethod] =
    React.useState<TopicVisualizationMethodEnum>(
      TopicVisualizationMethodEnum.InterTopicRelationship,
    );

  const topicModelingOptions = useTopicModelingOptionsAppState(column?.name);

  const { reset: resetDocuments } = documentTableState;
  const { reset: resetTopicModelingState } = topicModelingOptions;
  React.useEffect(() => {
    setTopics([]);
    resetDocuments();
  }, [column, resetDocuments]);

  const reset = React.useCallback(() => {
    resetDocuments();
    setTopics([]);
    resetTopicModelingState();
    setColumn(null);
  }, [resetDocuments, resetTopicModelingState]);

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
        reset,
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

export function useCurrentTopicModelingResult() {
  const column = useTopicAppState((store) => store.column);
  return useTopicModelingResultOfColumn(column?.name);
}
