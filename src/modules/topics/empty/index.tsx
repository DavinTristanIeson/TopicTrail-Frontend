import {
  invalidateProjectDependencyQueries,
  TextualSchemaColumnModel,
} from '@/api/project';
import React from 'react';
import { Stack } from '@mantine/core';
import useTopicModelingActions from './status-check';
import TopicModelingProgressLogs from './progress-logs';
import ProjectTopicsEmptyPageControls from './controls';
import { ProjectContext } from '@/modules/project/context';
import { showNotification } from '@mantine/notifications';

interface ProjectTopicsEmptyPageProps {
  column: TextualSchemaColumnModel;
}
export default function ProjectTopicsEmptyPage(
  props: ProjectTopicsEmptyPageProps,
) {
  const { column } = props;
  const project = React.useContext(ProjectContext);
  const topicModelingActions = useTopicModelingActions(column.name);
  const { progress } = topicModelingActions;

  const hasAcknowledgedSuccessfulTopicModeling = React.useRef(false);

  React.useEffect(() => {
    if (!progress?.data || hasAcknowledgedSuccessfulTopicModeling.current)
      return;

    const message = `We have successfully finished running the topic modeling algorithm on the documents of "${column}".`;
    showNotification({
      message,
      color: 'green',
      autoClose: 5000,
    });
    invalidateProjectDependencyQueries(project.id);
    hasAcknowledgedSuccessfulTopicModeling.current = true;
  }, [column, progress?.data, project.id]);
  return (
    <Stack className="pb-8">
      <ProjectTopicsEmptyPageControls {...topicModelingActions} />
      <TopicModelingProgressLogs {...topicModelingActions} />
    </Stack>
  );
}
