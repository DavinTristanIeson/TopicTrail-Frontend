import { NextPageWithLayout } from '@/common/utils/types';
import { GridSkeleton } from '@/components/visual/loading';
import {
  ComparisonPageTab,
  useComparisonAppState,
} from '@/modules/comparison/app-state';
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

const ComparisonPage: NextPageWithLayout = function () {
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const tab = useComparisonAppState((store) => store.tab);
  const setTab = useComparisonAppState((store) => store.setTab);

  return (
    <>
      {comparisonGroups.length < 2 && (
        <Alert color="yellow" icon={<Warning size={20} />} className="mb-3">
          First things first, create at least two groups to be compared. Each
          group represents a subset of your dataset, which is defined by a name
          and a filter. Press the &quot;Add New Group&quot; button to create a
          new group.
        </Alert>
      )}

      <Tabs value={tab} onChange={setTab as any} allowTabDeactivation={false}>
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
            disabled={comparisonGroups.length === 0}
          >
            Visualization
          </Tabs.Tab>
          <Tabs.Tab
            value={ComparisonPageTab.StatisticTest}
            leftSection={<TestTube />}
            disabled={comparisonGroups.length === 0}
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
    </>
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
