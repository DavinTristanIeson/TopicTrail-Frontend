import { invalidateProjectDependencyQueries } from '@/api/project';
import React from 'react';
import { Stack } from '@mantine/core';
import useTopicModelingActions from '../behavior/procedure';
import TaskProgressLogs from '../../task/progress-logs';
import ProjectTopicsEmptyPageControls from './controls';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import { showNotification } from '@mantine/notifications';
import { queryClient } from '@/common/api/query-client';
import { client } from '@/common/api/client';
import { DefaultErrorViewBoundary } from '@/components/visual/error';

export default function ProjectTopicsEmptyPage() {
  const project = React.useContext(ProjectContext);
  const column = React.useContext(SchemaColumnContext);
  const topicModelingActions = useTopicModelingActions(column.name);
  const { progress } = topicModelingActions;

  const hasAcknowledgedSuccessfulTopicModeling = React.useRef<string | null>(
    null,
  );

  React.useEffect(() => {
    if (
      !progress?.data ||
      hasAcknowledgedSuccessfulTopicModeling.current === column.name
    ) {
      return;
    }

    const message = `We have successfully finished running the topic modeling algorithm on the documents of "${column.name}".`;
    showNotification({
      message,
      color: 'green',
      autoClose: 5000,
    });

    const queryKey = client.queryOptions('get', '/topic/{project_id}/', {
      params: {
        path: {
          project_id: project.id,
        },
      },
    }).queryKey;
    queryClient.removeQueries({
      queryKey: queryKey,
    });
    invalidateProjectDependencyQueries(project.id);
    topicModelingActions.resetCurrentTopicModelingOptions();
    hasAcknowledgedSuccessfulTopicModeling.current = column.name;
  }, [column.name, progress?.data, project.id, topicModelingActions]);
  return (
    <Stack className="pb-8">
      <DefaultErrorViewBoundary>
        <ProjectTopicsEmptyPageControls {...topicModelingActions} />
        <TaskProgressLogs {...topicModelingActions} />
      </DefaultErrorViewBoundary>
    </Stack>
  );
}
