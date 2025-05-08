import { Stack } from '@mantine/core';
import TopicModelExperimentHyperparameterControls from './controls';
import React from 'react';
import TaskProgressLogs from '@/modules/task/progress-logs';
import { FormEditableContext } from '@/components/standard/fields/context';
import { useTopicModelExperimentStatusQuery } from '../app-state';

export default function TopicModelExperimentConstraintTab() {
  const statusCheck = useTopicModelExperimentStatusQuery();
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
