import { TextualSchemaColumnModel } from '@/api/project';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

interface TopicEvaluationAppStateContextType {
  column: TextualSchemaColumnModel | null;
  setColumn: React.Dispatch<
    React.SetStateAction<TextualSchemaColumnModel | null>
  >;
  reset(): void;
}

const TopicEvaluationAppStateContext =
  createContext<TopicEvaluationAppStateContextType>(null as any);

export default function TopicEvaluationAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [column, setColumn] = React.useState<TextualSchemaColumnModel | null>(
    null,
  );
  const reset = React.useCallback(() => {
    setColumn(null);
  }, []);

  return (
    <TopicEvaluationAppStateContext.Provider
      value={{
        column,
        setColumn,
        reset,
      }}
    >
      {props.children}
    </TopicEvaluationAppStateContext.Provider>
  );
}

export function useTopicEvaluationAppState<T>(
  selector: (store: TopicEvaluationAppStateContextType) => T,
) {
  return useContextSelector(TopicEvaluationAppStateContext, selector);
}
