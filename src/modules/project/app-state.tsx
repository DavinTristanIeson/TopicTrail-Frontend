import React from 'react';
import { ProjectAllTopicsProvider } from '../topics/components/context';
import AppProjectLayout from './layout';
import TableAppStateProvider from '../table/app-state';
import TopicAppStateProvider from '../topics/app-state';
import ComparisonAppStateProvider from '../comparison/app-state';
import TopicCorrelationAppStateProvider from '../topic-correlation/app-state';

// Aggregates all of the different app state providers
export function ProjectAppStateProvider(props: React.PropsWithChildren) {
  return (
    <TopicAppStateProvider>
      <TableAppStateProvider>
        <ComparisonAppStateProvider>
          <TopicCorrelationAppStateProvider>
            {props.children}
          </TopicCorrelationAppStateProvider>
        </ComparisonAppStateProvider>
      </TableAppStateProvider>
    </TopicAppStateProvider>
  );
}

// Helpers

export function ProjectCommonDependencyProvider(
  props: React.PropsWithChildren,
) {
  return (
    <AppProjectLayout>
      <ProjectAllTopicsProvider>
        {/* If project or topics is invalidated, ProjectAppStateProvider will be remounted, which resets the state.
        That's the behavior that we want.*/}
        <ProjectAppStateProvider>{props.children}</ProjectAppStateProvider>
      </ProjectAllTopicsProvider>
    </AppProjectLayout>
  );
}
