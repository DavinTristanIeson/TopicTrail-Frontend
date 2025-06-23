import React from 'react';
import { STATISTICAL_ANALYSIS_CONFIGURATION } from '../statistic-test-config';
import { StatisticalAnalysisPurpose } from '../types';
import FetchWrapperComponent from '@/components/utility/fetch-wrapper';
import { Skeleton } from '@mantine/core';

interface StatisticalAnalysisResultRendererProps {
  purpose: StatisticalAnalysisPurpose;
  input: any;
  committed: boolean;
}

export default function StatisticalAnalysisResultRenderer(
  props: StatisticalAnalysisResultRendererProps,
) {
  const { purpose, input, committed } = props;
  const configItem = STATISTICAL_ANALYSIS_CONFIGURATION[purpose];
  const useDataProvider = configItem.dataProvider;
  const ResultRenderer = configItem.component;

  if (!configItem) {
    throw new Error(`Statistical analysis for ${purpose} is not implemented.`);
  }
  const { data, error, loading, refetch } = useDataProvider({
    config: input,
    committed,
  });

  return (
    <FetchWrapperComponent
      loadingComponent={<Skeleton w="100%" h={720} />}
      isLoading={loading}
      error={error}
      onRetry={refetch}
    >
      {data && <ResultRenderer config={input} data={data} />}
    </FetchWrapperComponent>
  );
}
