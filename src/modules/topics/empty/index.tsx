import { invalidateProjectDependencyQueries } from '@/api/project';
import React from 'react';
import { Stack } from '@mantine/core';
import useTopicModelingActions from '../behavior/procedure';
import TaskProgressLogs from '../../task/progress-logs';
import ProjectTopicsEmptyPageControls from './controls';
import { ProjectContext } from '@/modules/project/context';
import { showNotification } from '@mantine/notifications';
import { DefaultErrorViewBoundary } from '@/components/visual/error';
import { useTopicAppState } from '../app-state';
import { TopicModelingResultQueryResetContext } from '../components/context';

export default function ProjectTopicsEmptyPage() {
  const project = React.useContext(ProjectContext);
  const column = useTopicAppState((store) => store.column!);
  const topicModelingActions = useTopicModelingActions(column.name);
  const refetchTopicModelingResult = React.useContext(
    TopicModelingResultQueryResetContext,
  );
  const { progress } = topicModelingActions;

  const { resetCurrentTopicModelingOptions } = topicModelingActions;
  const acknowledgeSuccess = React.useCallback(async () => {
    const message = `We have successfully finished running the topic modeling algorithm on the documents of "${column.name}".`;
    showNotification({
      id: 'notify-done',
      message,
      color: 'green',
      autoClose: 5000,
    });

    await refetchTopicModelingResult();

    invalidateProjectDependencyQueries(project.id);
    resetCurrentTopicModelingOptions();
  }, [
    column.name,
    project.id,
    refetchTopicModelingResult,
    resetCurrentTopicModelingOptions,
  ]);

  React.useEffect(() => {
    if (!progress?.data) {
      return;
    }
    acknowledgeSuccess();
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
