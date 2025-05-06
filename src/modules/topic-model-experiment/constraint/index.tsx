import { Stack } from '@mantine/core';
import TopicModelExperimentHyperparameterControls from './controls';
import { client } from '@/common/api/client';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import { useTopicAppState } from '@/modules/topics/app-state';
import { usePeriodicTaskStatusCheck } from '@/modules/task/status-check';
import TaskProgressLogs from '@/modules/task/progress-logs';
import { FormEditableContext } from '@/components/standard/fields/context';

export default function TopicModelExperimentConstraintTab() {
  const project = React.useContext(ProjectContext);
  const column = useTopicAppState((store) => store.column!);
  const query = client.useQuery(
    'get',
    '/topic/{project_id}/experiment/status',
    {
      params: {
        path: {
          project_id: project.id,
        },
        query: {
          column: column.name,
        },
      },
    },
  );
  const statusCheck = usePeriodicTaskStatusCheck({ query });
  const formEditableState = React.useMemo(() => {
    return {
      editable: !(statusCheck.isStillPolling || statusCheck.isCheckingStatus),
      setEditable() {},
    };
  }, [statusCheck.isCheckingStatus, statusCheck.isStillPolling]);
  return (
    <Stack>
      <FormEditableContext.Provider value={formEditableState}>
        <TopicModelExperimentHyperparameterControls />
      </FormEditableContext.Provider>
      <TaskProgressLogs {...statusCheck} />
    </Stack>
  );
}
