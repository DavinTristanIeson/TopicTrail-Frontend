import { filterProjectColumnsByType } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import NavigationRoutes from '@/common/constants/routes';
import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectPageLinks } from '@/components/utility/links';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { ProjectContext } from '@/modules/project/context';
import { useTopicCorrelationAppState } from '@/modules/topic-correlation/app-state';
import TopicCorrelationColumnControls from '@/modules/topic-correlation/controls';
import TopicCorrelationDashboard from '@/modules/topic-correlation/dashboard';
import { AllTopicModelingResultContext } from '@/modules/topics/components/context';
import { NoTextualColumnWarning } from '@/modules/topics/components/warnings';
import { Alert, Stack } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import React from 'react';

const TopicCorrelationPage: NextPageWithLayout = function () {
  const column = useTopicCorrelationAppState((store) => store.column);

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
  return (
    <Stack>
      <TopicCorrelationColumnControls />
      {column && <TopicCorrelationDashboard />}
    </Stack>
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
