import React from 'react';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { TopicModelExperimentResultSummaryPlot } from './visualization/plot';
import { useTopicModelExperimentStatusQuery } from '../app-state';

export default function TopicModelExperimentResultSummaryTab() {
  const { query } = useTopicModelExperimentStatusQuery();
  const data = query.data?.data;
  return (
    <UseQueryWrapperComponent query={query} isLoading={query.isLoading}>
      {data && <TopicModelExperimentResultSummaryPlot data={data} />}
    </UseQueryWrapperComponent>
  );
}
