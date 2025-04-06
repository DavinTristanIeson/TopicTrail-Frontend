import { PaginationParams } from '@/api/table';
import { DashboardItemModel } from '@/api/userdata';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { ProjectAllTopicsProvider } from '../topics/components/context';
import AppProjectLayout from './layout';
import { NamedTableFilterModel } from '@/api/comparison';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';

interface DashboardStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
}

interface ProjectAppStateContextType {
  table: DashboardStateContextType & {
    params: {
      state: PaginationParams;
      setState: React.Dispatch<React.SetStateAction<PaginationParams>>;
    };
  };
  comparison: DashboardStateContextType & {
    groups: {
      state: NamedTableFilterModel[];
      handlers: UseListStateHandlers<NamedTableFilterModel>;
    };
  };
  correlation: DashboardStateContextType;
}

const ProjectAppStateContext = createContext<ProjectAppStateContextType>(
  null as any,
);

export function ProjectAppStateProvider(props: React.PropsWithChildren) {
  const [tableParams, setTableParams] = React.useState<PaginationParams>({
    limit: 25,
    page: 0,
    filter: null,
    sort: null,
  });
  const [comparisonState, comparisonStateHandlers] =
    useListState<NamedTableFilterModel>();
  const [tableDashboard, tableDashboardHandlers] =
    useListState<DashboardItemModel>([]);
  const [comparisonDashboard, comparisonDashboardHandlers] =
    useListState<DashboardItemModel>([]);
  const [correlationDashboard, correlationDashboardHandlers] =
    useListState<DashboardItemModel>([]);

  return (
    <ProjectAppStateContext.Provider
      value={{
        table: {
          params: {
            state: tableParams,
            setState: setTableParams,
          },
          dashboard: {
            state: tableDashboard,
            handlers: tableDashboardHandlers,
          },
        },
        comparison: {
          groups: {
            state: comparisonState,
            handlers: comparisonStateHandlers,
          },
          dashboard: {
            state: comparisonDashboard,
            handlers: comparisonDashboardHandlers,
          },
        },
        correlation: {
          dashboard: {
            state: correlationDashboard,
            handlers: correlationDashboardHandlers,
          },
        },
      }}
    >
      {props.children}
    </ProjectAppStateContext.Provider>
  );
}

export function useProjectAppState<T>(
  selector: (value: ProjectAppStateContextType) => T,
): T {
  return useContextSelector(ProjectAppStateContext, selector);
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
