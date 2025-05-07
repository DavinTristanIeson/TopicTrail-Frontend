import { BERTopicHyperparameterConstraintModel } from '@/api/topic';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { useTopicAppState } from '../topics/app-state';

export enum TopicModelExperimentTab {
  Constraint = 'constraint',
  Results = 'results',
}

export enum TopicModelExperimentResultVisualizationType {
  HyperparameterPerTrial = 'hyperparameter-per-trial',
  EvaluationPerTrial = 'evaluation-per-trial',
  HyperparameterPerEvaluation = 'hyperparameter-per-evaluation',
  EvaluationPerHyperparameter = 'evaluation-per-hyperparameter',
}

export enum TopicModelExperimentResultSortBy {
  TopicCount = 'topic-count',
  TopicCoherence = 'topic-coherence',
  TopicDiversity = 'topic-diversity',
  TrialNumber = 'trial-number',
  MaxTopics = 'max-topics',
  MinTopicSize = 'min-topic-size',
  TopicConfidenceThreshold = 'topic-confidence-threshold',
}

interface TopicModelExperimentAppStateContextType {
  constraints: Record<string, BERTopicHyperparameterConstraintModel | null>;
  setConstraints: React.Dispatch<
    React.SetStateAction<
      Record<string, BERTopicHyperparameterConstraintModel | null>
    >
  >;
  visualizationMethod: TopicModelExperimentResultVisualizationType | null;
  setVisualizationMethod: React.Dispatch<
    React.SetStateAction<TopicModelExperimentResultVisualizationType | null>
  >;
  tab: TopicModelExperimentTab;
  setTab: React.Dispatch<React.SetStateAction<TopicModelExperimentTab>>;
  sortBy: TopicModelExperimentResultSortBy | null;
  setSortBy: React.Dispatch<
    React.SetStateAction<TopicModelExperimentResultSortBy | null>
  >;
  showFailed: boolean;
  setShowFailed: React.Dispatch<React.SetStateAction<boolean>>;
  reset(): void;
}

const TopicModelExperimentAppStateContext =
  createContext<TopicModelExperimentAppStateContextType>(null as any);

export default function TopicModelExperimentAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [constraints, setConstraints] = React.useState({});
  const [tab, setTab] = React.useState(TopicModelExperimentTab.Constraint);
  const [showFailed, setShowFailed] = React.useState(false);
  const [sortBy, setSortBy] =
    React.useState<TopicModelExperimentResultSortBy | null>(
      TopicModelExperimentResultSortBy.TrialNumber,
    );
  const [visualizationMethod, setVisualizationMethod] =
    React.useState<TopicModelExperimentResultVisualizationType | null>(
      TopicModelExperimentResultVisualizationType.EvaluationPerTrial,
    );
  const reset = React.useCallback(() => {
    setConstraints({});
  }, []);
  return (
    <TopicModelExperimentAppStateContext.Provider
      value={{
        constraints,
        setConstraints,
        tab,
        setTab,
        sortBy,
        setSortBy,
        visualizationMethod,
        setVisualizationMethod,
        showFailed,
        setShowFailed,
        reset,
      }}
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
