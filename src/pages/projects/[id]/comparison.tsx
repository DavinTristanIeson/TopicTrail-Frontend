import { type NamedTableFilterModel } from '@/api/comparison';
import { NextPageWithLayout } from '@/common/utils/types';
import { GridSkeleton } from '@/components/visual/loading';
import { NamedFiltersContext } from '@/modules/comparison/context';
import NamedFiltersManager from '@/modules/comparison/filter';
import ComparisonStatisticTest from '@/modules/comparison/statistic-test';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { DashboardControls } from '@/modules/visualization/dashboard/controls';
import { Alert, Stack, Tabs } from '@mantine/core';
import { ListNumbers, Shapes, TestTube, Warning } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
import React from 'react';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

enum ComparisonPageTab {
  GroupsManager = 'group-manager',
  Visualization = 'visualization',
  StatisticTest = 'statistic-test',
}

const ComparisonPage: NextPageWithLayout = function () {
  const [filters, setFilters] = React.useState<NamedTableFilterModel[]>([]);
  const [tab, setTab] = React.useState<string | null>(
    ComparisonPageTab.GroupsManager,
  );

  return (
    <NamedFiltersContext.Provider value={{ filters, setFilters }}>
      {filters.length < 2 && (
        <Alert color="yellow" icon={<Warning size={20} />} className="mb-3">
          First things first, create at least two groups to be compared. Each
          group represents a subset of your dataset, which is defined by a name
          and a filter. Press the &quot;Add New Group&quot; button to create a
          new group.
        </Alert>
      )}

      <Tabs value={tab} onChange={setTab} allowTabDeactivation={false}>
        <Tabs.List>
          <Tabs.Tab
            value={ComparisonPageTab.GroupsManager}
            leftSection={<ListNumbers />}
          >
            Groups Manager
          </Tabs.Tab>
          <Tabs.Tab
            value={ComparisonPageTab.Visualization}
            leftSection={<Shapes />}
            disabled={filters.length === 0}
          >
            Visualization
          </Tabs.Tab>
          <Tabs.Tab
            value={ComparisonPageTab.StatisticTest}
            leftSection={<TestTube />}
            disabled={filters.length === 0}
          >
            Statistic Test
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <div className="py-5">
        {tab === ComparisonPageTab.GroupsManager ? (
          <NamedFiltersManager />
        ) : tab === ComparisonPageTab.Visualization ? (
          <Stack>
            <DashboardControls />
            <GridstackDashboard />
          </Stack>
        ) : tab === ComparisonPageTab.StatisticTest ? (
          <ComparisonStatisticTest />
        ) : null}
      </div>
    </NamedFiltersContext.Provider>
  );
};

ComparisonPage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default ComparisonPage;
