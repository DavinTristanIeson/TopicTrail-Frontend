import React from 'react';
import { ProjectAllTopicsProvider } from '../topics/components/context';
import AppProjectLayout from './layout';
import TableAppStateProvider, { useTableAppState } from '../table/app-state';
import TopicAppStateProvider, { useTopicAppState } from '../topics/app-state';
import ComparisonAppStateProvider, {
  useComparisonAppState,
} from '../comparison/app-state';
import { useRouter } from 'next/router';
import { createContext, useContextSelector } from 'use-context-selector';
import TopicModelExperimentAppStateProvider, {
  useTopicModelExperimentAppState,
} from '../topic-model-experiment/app-state';

interface ProjectAppStateActionsProps {
  reset(): void;
}

const ProjectAppStateActionsContext =
  createContext<ProjectAppStateActionsProps>({
    reset() {},
  });

export function useResetProjectAppState() {
  return useContextSelector(
    ProjectAppStateActionsContext,
    (store) => store.reset,
  );
}

function ProjectAppStateActionsProvider(props: React.PropsWithChildren) {
  const resetTopics = useTopicAppState((store) => store.reset);
  const resetTable = useTableAppState((store) => store.reset);
  const resetComparison = useComparisonAppState((store) => store.reset);
  const resetExperiment = useTopicModelExperimentAppState(
    (store) => store.reset,
  );
  const reset = React.useCallback(() => {
    resetTopics();
    resetTable();
    resetComparison();
    resetExperiment();
  }, [resetComparison, resetExperiment, resetTable, resetTopics]);
  return (
    <ProjectAppStateActionsContext.Provider value={{ reset }}>
      {props.children}
    </ProjectAppStateActionsContext.Provider>
  );
}

// Aggregates all of the different app state providers
export function ProjectAppStateProvider(props: React.PropsWithChildren) {
  return (
    <TopicAppStateProvider>
      <TableAppStateProvider>
        <ComparisonAppStateProvider>
          <TopicModelExperimentAppStateProvider>
            <ProjectAppStateActionsProvider>
              {props.children}
            </ProjectAppStateActionsProvider>
          </TopicModelExperimentAppStateProvider>
        </ComparisonAppStateProvider>
      </TableAppStateProvider>
    </TopicAppStateProvider>
  );
}

// Helpers

export function ProjectCommonDependencyProvider(
  props: React.PropsWithChildren,
) {
  const id = useRouter().query.id as string;
  // Remount everything once you change project
  return (
    <ProjectAppStateProvider key={id}>
      <AppProjectLayout key={id}>
        <ProjectAllTopicsProvider key={id}>
          {props.children}
        </ProjectAllTopicsProvider>
      </AppProjectLayout>
    </ProjectAppStateProvider>
  );
}
