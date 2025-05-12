import { invalidateProjectDependencyQueries } from '@/api/project';
import React from 'react';
import { Stack } from '@mantine/core';
import useTopicModelingActions from '../behavior/procedure';
import TaskProgressLogs from '../../task/progress-logs';
import ProjectTopicsEmptyPageControls from './controls';
import { ProjectContext } from '@/modules/project/context';
import { showNotification } from '@mantine/notifications';
import { queryClient } from '@/common/api/query-client';
import { client } from '@/common/api/client';
import { DefaultErrorViewBoundary } from '@/components/visual/error';
import { useTopicAppState } from '../app-state';

export default function ProjectTopicsEmptyPage() {
  const project = React.useContext(ProjectContext);
  const column = useTopicAppState((store) => store.column!);
  const topicModelingActions = useTopicModelingActions(column.name);
  const { progress } = topicModelingActions;

  const hasAcknowledgedSuccessfulTopicModeling = React.useRef<string | null>(
    null,
  );

  const { resetCurrentTopicModelingOptions } = topicModelingActions;
  const acknowledgeSuccess = React.useCallback(() => {
    const message = `We have successfully finished running the topic modeling algorithm on the documents of "${column.name}".`;
    showNotification({
      id: 'notify-done',
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
    queryClient.refetchQueries({
      queryKey: queryKey,
    });
    invalidateProjectDependencyQueries(project.id);
    resetCurrentTopicModelingOptions();
  }, [column.name, project.id, resetCurrentTopicModelingOptions]);

  React.useEffect(() => {
    if (
      !progress?.data ||
      hasAcknowledgedSuccessfulTopicModeling.current === column.name
    ) {
      return;
    }
    acknowledgeSuccess();
    hasAcknowledgedSuccessfulTopicModeling.current = column.name;
  }, [acknowledgeSuccess, column.name, progress?.data, project.id]);

  return (
    <Stack className="pb-8">
      <DefaultErrorViewBoundary>
        <ProjectTopicsEmptyPageControls {...topicModelingActions} />
        <TaskProgressLogs {...topicModelingActions} />
      </DefaultErrorViewBoundary>
    </Stack>
  );
}
