import { NextPageWithLayout } from '@/common/utils/types';
import {
  ComparisonPageTab,
  useComparisonAppState,
} from '@/modules/comparison/app-state';
import ComparisonDashboard from '@/modules/comparison/dashboard';
import NamedFiltersManager from '@/modules/comparison/filter';
import ComparisonStatisticTest from '@/modules/comparison/statistic-test';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { Alert, Tabs } from '@mantine/core';
import { ListNumbers, Shapes, TestTube, Warning } from '@phosphor-icons/react';
import React from 'react';

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
            Subdatasets
          </Tabs.Tab>
          <Tabs.Tab
            value={ComparisonPageTab.Visualization}
            leftSection={<Shapes />}
            disabled={comparisonGroups.length === 0}
          >
            Dashboard
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
          <ComparisonDashboard />
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
