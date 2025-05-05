import { NextPageWithLayout } from '@/common/utils/types';
import { DefaultErrorViewBoundary } from '@/components/visual/error';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import {
  TopicCorrelationPageTab,
  useCheckTopicCorrelationTargetVisibility,
  useTopicCorrelationAppState,
} from '@/modules/topic-correlation/app-state';
import TopicCorrelationTopicsManager from '@/modules/topic-correlation/controls';
import TopicCorrelationDashboard from '@/modules/topic-correlation/dashboard';
import { MinimalTopicRequirementSafeguard } from '@/modules/topics/components/warnings';
import { Tabs } from '@mantine/core';
import { ListNumbers, Shapes } from '@phosphor-icons/react';
import React from 'react';

function TopicCorrelationTabs() {
  const tab = useTopicCorrelationAppState((store) => store.tab);
  const setTab = useTopicCorrelationAppState((store) => store.setTab);
  const topics = useTopicCorrelationAppState((store) => store.topics);
  const { onlyVisible } = useCheckTopicCorrelationTargetVisibility();
  const visibleTopics = onlyVisible(topics ?? []);
  return (
    <>
      <Tabs value={tab} onChange={setTab as any} allowTabDeactivation={false}>
        <Tabs.List>
          <Tabs.Tab
            value={TopicCorrelationPageTab.TopicsManager}
            leftSection={<ListNumbers />}
          >
            Topics Manager
          </Tabs.Tab>
          <Tabs.Tab
            value={TopicCorrelationPageTab.Dashboard}
            leftSection={<Shapes />}
            disabled={!topics || visibleTopics.length === 0}
          >
            Dashboard
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <div className="py-5">
        <DefaultErrorViewBoundary>
          {tab === TopicCorrelationPageTab.TopicsManager ? (
            <TopicCorrelationTopicsManager />
          ) : tab === TopicCorrelationPageTab.Dashboard ? (
            <TopicCorrelationDashboard />
          ) : null}
        </DefaultErrorViewBoundary>
      </div>
    </>
  );
}

const TopicCorrelationPage: NextPageWithLayout = function () {
  return (
    <MinimalTopicRequirementSafeguard>
      <TopicCorrelationTabs />
    </MinimalTopicRequirementSafeguard>
  );
};

TopicCorrelationPage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default TopicCorrelationPage;
