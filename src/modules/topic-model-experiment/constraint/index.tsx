import { Space } from '@mantine/core';
import TopicModelExperimentHyperparameterControls from './controls';
import React from 'react';
import TaskProgressLogs from '@/modules/task/progress-logs';
import { FormEditableContext } from '@/components/standard/fields/context';
import {
  useCurrentTopicModelExperimentAppState,
  useTopicModelExperimentStatusQuery,
} from '../app-state';

export default function TopicModelExperimentConstraintTab() {
  const { environment, setEnvironment } =
    useCurrentTopicModelExperimentAppState();
  const statusCheck = useTopicModelExperimentStatusQuery();
  const { query } = statusCheck;
  const topicModelExperimentData = query.data?.data;

  React.useEffect(() => {
    if (topicModelExperimentData && !environment) {
      setEnvironment({
        constraint: topicModelExperimentData.constraint,
        n_trials: topicModelExperimentData.max_trials,
      });
    }
  }, [environment, setEnvironment, topicModelExperimentData]);

  const formEditableState = React.useMemo(() => {
    return {
      editable: !(statusCheck.isStillPolling || statusCheck.isCheckingStatus),
      setEditable() {},
    };
  }, [statusCheck.isCheckingStatus, statusCheck.isStillPolling]);
  return (
    <div className="pb-5">
      <FormEditableContext.Provider value={formEditableState}>
        <TopicModelExperimentHyperparameterControls
          key={JSON.stringify(environment)}
        />
      </FormEditableContext.Provider>
      <Space h="xl" />
      <TaskProgressLogs {...statusCheck} />
    </div>
  );
}
