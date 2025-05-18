import { client } from '@/common/api/client';
import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { ProjectContext } from '@/modules/project/context';
import TaskProgressLogs from '@/modules/task/progress-logs';
import { usePeriodicTaskStatusCheck } from '@/modules/task/status-check';
import TopicEvaluationControls from '@/modules/topic-evaluation/controls';
import TopicEvaluationResultComponent from '@/modules/topic-evaluation/result';
import { useTopicAppState } from '@/modules/topics/app-state';
import {
  ProjectFocusedTextualColumnControls,
  ReturnToTopicsPageButton,
} from '@/modules/topics/components/controls';
import { TopicModelingRequirementSafeguard } from '@/modules/topics/components/warnings';
import { Space, Stack } from '@mantine/core';
import React from 'react';

function TopicEvaluationPageInternal() {
  const column = useTopicAppState((store) => store.column!);
  const project = React.useContext(ProjectContext);
  const query = client.useQuery(
    'get',
    '/topic/{project_id}/evaluation/status',
    {
      params: {
        path: {
          project_id: project.id,
        },
        query: {
          column: column.name ?? '',
        },
      },
    },
  );
  const periodicChecks = usePeriodicTaskStatusCheck({ query });
  const { isStillPolling } = periodicChecks;
  const data = query.data?.data;
  return (
    <>
      <TopicEvaluationControls isRunning={isStillPolling} />
      {!data || isStillPolling ? (
        <TaskProgressLogs {...periodicChecks} />
      ) : (
        <TopicEvaluationResultComponent data={data} />
      )}
      <Space h="md" />
    </>
  );
}

const TopicEvaluationPage: NextPageWithLayout = function () {
  const column = useTopicAppState((store) => store.column!);
  return (
    <Stack>
      <ProjectFocusedTextualColumnControls
        onlyColumnsWithTopics
        Right={<ReturnToTopicsPageButton />}
      />
      <TopicModelingRequirementSafeguard canSelectColumn>
        {column && <TopicEvaluationPageInternal />}
      </TopicModelingRequirementSafeguard>
    </Stack>
  );
};

TopicEvaluationPage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default TopicEvaluationPage;
