import React from 'react';
import { STATISTICAL_ANALYSIS_CONFIGURATION } from '../statistic-test-config';
import { StatisticalAnalysisPurpose } from '../types';
import FetchWrapperComponent from '@/components/utility/fetch-wrapper';
import { Skeleton } from '@mantine/core';

interface StatisticalAnalysisResultRendererProps {
  purpose: StatisticalAnalysisPurpose;
  input: any;
}

export default function StatisticalAnalysisResultRenderer(
  props: StatisticalAnalysisResultRendererProps,
) {
  const { purpose, input } = props;
  const configItem = STATISTICAL_ANALYSIS_CONFIGURATION[purpose];
  const useDataProvider = configItem.dataProvider;
  const ResultRenderer = configItem.component;

  if (!configItem) {
    throw new Error(`Statistical analysis for ${purpose} is not implemented.`);
  }
  const { data, error, loading, refetch } = useDataProvider(input);

  const firstTime = React.useRef(true);
  React.useEffect(() => {
    if (firstTime.current) {
      firstTime.current = false;
      return;
    }
    refetch();
  }, [input, refetch]);

  return (
    <FetchWrapperComponent
      loadingComponent={<Skeleton w="100%" h={720} />}
      isLoading={loading}
      error={error}
      onRetry={refetch}
    >
      <ResultRenderer config={input} data={data} />
    </FetchWrapperComponent>
  );
}
