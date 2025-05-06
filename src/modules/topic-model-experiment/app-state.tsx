import { BERTopicHyperparameterConstraintModel } from '@/api/topic';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { useTopicAppState } from '../topics/app-state';

export enum TopicModelExperimentTab {
  Constraint = 'constraint',
  Results = 'results',
}

interface TopicModelExperimentAppStateContextType {
  constraints: Record<string, BERTopicHyperparameterConstraintModel | null>;
  setConstraints: React.Dispatch<
    React.SetStateAction<
      Record<string, BERTopicHyperparameterConstraintModel | null>
    >
  >;
  tab: TopicModelExperimentTab;
  setTab: React.Dispatch<React.SetStateAction<TopicModelExperimentTab>>;
  reset(): void;
}

const TopicModelExperimentAppStateContext =
  createContext<TopicModelExperimentAppStateContextType>(null as any);

export default function TopicModelExperimentAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [constraints, setConstraints] = React.useState({});
  const [tab, setTab] = React.useState(TopicModelExperimentTab.Constraint);
  const reset = React.useCallback(() => {
    setConstraints({});
  }, []);
  return (
    <TopicModelExperimentAppStateContext.Provider
      value={{ constraints, setConstraints, tab, setTab, reset }}
    >
      {props.children}
    </TopicModelExperimentAppStateContext.Provider>
  );
}

export function useTopicModelExperimentAppState<T>(
  selector: (store: TopicModelExperimentAppStateContextType) => T,
) {
  return useContextSelector(TopicModelExperimentAppStateContext, selector);
}

export function useCurrentTopicModelExperimentAppState() {
  const column = useTopicAppState((store) => store.column);
  const constraint = useTopicModelExperimentAppState((store) =>
    column ? (store.constraints[column.name] ?? null) : null,
  );
  const setConstraints = useTopicModelExperimentAppState(
    (store) => store.setConstraints,
  );
  return {
    constraint,
    setConstraint: React.useCallback(
      (constraint: BERTopicHyperparameterConstraintModel) => {
        if (!column) return;
        setConstraints((prev) => {
          return {
            ...prev,
            [column.name]: constraint,
          };
        });
      },
      [setConstraints, column],
    ),
  };
}
