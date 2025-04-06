import { PaginationParams } from '@/api/table';
import { ComparisonStateModel, DashboardModel } from '@/api/userdata';
import { useRouter } from 'next/router';
import React from 'react';
import { createContext } from 'use-context-selector';
import { ProjectAllTopicsProvider } from '../topics/components/context';
import AppProjectLayout from './layout';

interface DashboardStateContextType {
  dashboard: DashboardModel;
  setDashboard: React.Dispatch<React.SetStateAction<DashboardModel>>;
}

interface ProjectAppStateContextType {
  table: DashboardStateContextType & {
    state: PaginationParams;
    setState: React.Dispatch<React.SetStateAction<PaginationParams>>;
  };
  comparison: DashboardStateContextType & {
    state: ComparisonStateModel;
    setState: React.Dispatch<React.SetStateAction<ComparisonStateModel>>;
  };
  correlation: DashboardStateContextType;
}

export const ProjectAppStateContext = createContext<ProjectAppStateContextType>(
  null as any,
);

export function ProjectAppStateProvider(props: React.PropsWithChildren) {
  const [tableState, setTableState] = React.useState<PaginationParams>({
    limit: 25,
    page: 0,
    filter: null,
    sort: null,
  });
  const [comparisonState, setComparisonState] =
    React.useState<ComparisonStateModel>({
      groups: [],
    });
  const [tableDashboard, setTableDashboard] = React.useState<DashboardModel>({
    items: [],
  });
  const [comparisonDashboard, setComparisonDashboard] =
    React.useState<DashboardModel>({
      items: [],
    });
  const [correlationDashboard, setCorrelationDashboard] =
    React.useState<DashboardModel>({
      items: [],
    });

  return (
    <ProjectAppStateContext.Provider
      value={{
        table: {
          state: tableState,
          setState: setTableState,
          dashboard: tableDashboard,
          setDashboard: setTableDashboard,
        },
        comparison: {
          state: comparisonState,
          setState: setComparisonState,
          dashboard: comparisonDashboard,
          setDashboard: setComparisonDashboard,
        },
        correlation: {
          dashboard: correlationDashboard,
          setDashboard: setCorrelationDashboard,
        },
      }}
    >
      {props.children}
    </ProjectAppStateContext.Provider>
  );
}

export function ProjectAppStateProviderLayout(props: React.PropsWithChildren) {
  const router = useRouter();
  const projectId = router.query.id as string;
  return (
    <ProjectAppStateProvider key={projectId}>
      {props.children}
    </ProjectAppStateProvider>
  );
}

export function ProjectCommonDependencyProvider(
  props: React.PropsWithChildren,
) {
  return (
    <ProjectAppStateProvider>
      <ProjectAllTopicsProvider>
        <AppProjectLayout>{props.children}</AppProjectLayout>
      </ProjectAllTopicsProvider>
    </ProjectAppStateProvider>
  );
}
