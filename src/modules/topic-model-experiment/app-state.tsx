import { TopicModelExperimentEnvironment } from '@/api/topic';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { useTopicAppState } from '../topics/app-state';
import { TopicModelExperimentValueType } from './results/component/select';
import { client } from '@/common/api/client';
import { ProjectContext } from '../project/context';
import { usePeriodicTaskStatusCheck } from '../task/status-check';

export enum TopicModelExperimentTab {
  Constraint = 'constraint',
  Summary = 'summary',
  Details = 'details',
}

export interface TopicModelExperimentValueSort {
  type: TopicModelExperimentValueType;
  asc: boolean;
}

interface TopicModelExperimentAppStateContextType {
  environments: Record<string, TopicModelExperimentEnvironment | null>;
  setEnvironments: React.Dispatch<
    React.SetStateAction<Record<string, TopicModelExperimentEnvironment | null>>
  >;
  tab: TopicModelExperimentTab;
  setTab: React.Dispatch<React.SetStateAction<TopicModelExperimentTab>>;

  details: {
    sortBy: TopicModelExperimentValueSort | null;
    setSortBy: React.Dispatch<
      React.SetStateAction<TopicModelExperimentValueSort | null>
    >;
    showFailed: boolean;
    setShowFailed: React.Dispatch<React.SetStateAction<boolean>>;
  };
  summary: {
    xType: TopicModelExperimentValueType | null;
    setXType: React.Dispatch<
      React.SetStateAction<TopicModelExperimentValueType | null>
    >;
    yType: TopicModelExperimentValueType | null;
    setYType: React.Dispatch<
      React.SetStateAction<TopicModelExperimentValueType | null>
    >;
    colorType: TopicModelExperimentValueType | null;
    setColorType: React.Dispatch<
      React.SetStateAction<TopicModelExperimentValueType | null>
    >;
  };
  reset(): void;
}

const TopicModelExperimentAppStateContext =
  createContext<TopicModelExperimentAppStateContextType>(null as any);

export default function TopicModelExperimentAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [environments, setEnvironments] = React.useState<
    Record<string, TopicModelExperimentEnvironment | null>
  >({});
  const [tab, setTab] = React.useState(TopicModelExperimentTab.Constraint);
  const [showFailed, setShowFailed] = React.useState(false);
  const [sortBy, setSortBy] =
    React.useState<TopicModelExperimentValueSort | null>({
      type: TopicModelExperimentValueType.TrialNumber,
      asc: true,
    });
  const [xType, setXType] =
    React.useState<TopicModelExperimentValueType | null>(
      TopicModelExperimentValueType.TrialNumber,
    );
  const [yType, setYType] =
    React.useState<TopicModelExperimentValueType | null>(
      TopicModelExperimentValueType.TopicCoherence,
    );
  const [colorType, setColorType] =
    React.useState<TopicModelExperimentValueType | null>(
      TopicModelExperimentValueType.TopicCoherence,
    );
  const reset = React.useCallback(() => {
    setEnvironments({});
  }, []);
  return (
    <TopicModelExperimentAppStateContext.Provider
      value={{
        environments,
        setEnvironments,
        tab,
        setTab,
        details: {
          sortBy,
          setSortBy,
          showFailed,
          setShowFailed,
        },
        summary: {
          xType,
          setXType,
          yType,
          setYType,
          colorType,
          setColorType,
        },
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
  const environment = useTopicModelExperimentAppState((store) =>
    column ? (store.environments[column.name] ?? null) : null,
  );
  const setEnvironment = useTopicModelExperimentAppState(
    (store) => store.setEnvironments,
  );
  return {
    environment,
    setEnvironment: React.useCallback(
      (constraint: TopicModelExperimentEnvironment) => {
        if (!column) return;
        setEnvironment((prev) => {
          return {
            ...prev,
            [column.name]: constraint,
          };
        });
      },
      [setEnvironment, column],
    ),
  };
}

export function useTopicModelExperimentStatusQuery() {
  const project = React.useContext(ProjectContext);
  const column = useTopicAppState((store) => store.column!);
  const query = client.useQuery(
    'get',
    '/topic/{project_id}/experiment/status',
    {
      params: {
        path: {
          project_id: project.id,
        },
        query: {
          column: column.name,
        },
      },
    },
  );
  const statusCheck = usePeriodicTaskStatusCheck({ query });
  return { ...statusCheck, query };
}
