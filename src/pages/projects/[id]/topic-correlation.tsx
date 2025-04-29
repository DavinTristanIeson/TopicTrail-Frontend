import { filterProjectColumnsByType } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import NavigationRoutes from '@/common/constants/routes';
import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectPageLinks } from '@/components/utility/links';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { ProjectContext } from '@/modules/project/context';
import {
  TopicCorrelationPageTab,
  useCheckTopicCorrelationTargetVisibility,
  useTopicCorrelationAppState,
} from '@/modules/topic-correlation/app-state';
import TopicCorrelationTopicsManager from '@/modules/topic-correlation/controls';
import TopicCorrelationDashboard from '@/modules/topic-correlation/dashboard';
import { AllTopicModelingResultContext } from '@/modules/topics/components/context';
import { NoTextualColumnWarning } from '@/modules/topics/components/warnings';
import { Alert, Tabs } from '@mantine/core';
import { ListNumbers, Shapes, Warning } from '@phosphor-icons/react';
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
        {tab === TopicCorrelationPageTab.TopicsManager ? (
          <TopicCorrelationTopicsManager />
        ) : tab === TopicCorrelationPageTab.Dashboard ? (
          <TopicCorrelationDashboard />
        ) : null}
      </div>
    </>
  );
}

const TopicCorrelationPage: NextPageWithLayout = function () {
  const project = React.useContext(ProjectContext);
  const textualColumns = filterProjectColumnsByType(project, [
    SchemaColumnTypeEnum.Textual,
  ]);
  const allTopicModelingResults = React.useContext(
    AllTopicModelingResultContext,
  );
  if (textualColumns.length === 0) {
    return <NoTextualColumnWarning />;
  }
  const topicModelingResults = allTopicModelingResults.filter(
    (topic) => !!topic.result,
  );
  if (topicModelingResults.length === 0) {
    return (
      <Alert icon={<Warning />} color="red" title="There are no topics!">
        {`Please run the topic modeling algorithm on at least one of the following columns: ${textualColumns.map((column) => column.name).join(', ')} in order to use the analysis methods in this page. You can find the topics from the `}
        <ProjectPageLinks route={NavigationRoutes.ProjectTopics}>
          Topics Page
        </ProjectPageLinks>
        .
      </Alert>
    );
  }
  return <TopicCorrelationTabs />;
};

TopicCorrelationPage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default TopicCorrelationPage;
