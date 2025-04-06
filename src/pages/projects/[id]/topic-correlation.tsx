import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import NavigationRoutes from '@/common/constants/routes';
import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectPageLinks } from '@/components/utility/links';
import { GridSkeleton } from '@/components/visual/loading';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { ProjectContext } from '@/modules/project/context';
import TopicCorrelationColumnControls from '@/modules/topic-correlation/controls';
import { AllTopicModelingResultContext } from '@/modules/topics/components/context';
import { NoTextualColumnWarning } from '@/modules/topics/components/warnings';
import { DashboardControls } from '@/modules/visualization/dashboard/controls';
import { Alert, Group, Stack } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
import React from 'react';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

const TopicCorrelationPage: NextPageWithLayout = function () {
  const [column1, setColumn1] = React.useState<SchemaColumnModel | null>(null);
  const [column2, setColumn2] = React.useState<SchemaColumnModel | null>(null);

  const project = React.useContext(ProjectContext);
  const textualColumns = project.config.data_schema.columns.filter(
    (col) => col.type === SchemaColumnTypeEnum.Textual,
  );
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
      <TopicCorrelationColumnControls
        column1={column1}
        setColumn1={setColumn1}
        column2={column2}
        setColumn2={setColumn2}
      />
      {column1 && column2 && (
        <>
          <Group justify="end">
            <DashboardControls />
          </Group>
          <GridstackDashboard />
        </>
      )}
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
