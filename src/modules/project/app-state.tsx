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
    <ProjectAppStateProvider>
      <AppProjectLayout>
        <ProjectAllTopicsProvider>{props.children}</ProjectAllTopicsProvider>
      </AppProjectLayout>
    </ProjectAppStateProvider>
  );
}
