import React from 'react';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TopicModelExperimentResultSummaryPlot } from './visualization/plot';
import { useTopicModelExperimentStatusQuery } from '../app-state';
import { TopicModelExperimentLoadingNotification } from './component/loading';

export default function TopicModelExperimentResultSummaryTab() {
  const { query, isStillPolling } = useTopicModelExperimentStatusQuery();
  const data = query.data?.data;
  return (
    <UseQueryWrapperComponent query={query} isLoading={query.isLoading}>
      {data && <TopicModelExperimentResultSummaryPlot data={data} />}
      <TopicModelExperimentLoadingNotification
        data={data}
        isStillPolling={isStillPolling}
      />
    </UseQueryWrapperComponent>
  );
}
