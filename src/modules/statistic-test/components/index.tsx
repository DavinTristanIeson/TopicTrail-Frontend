import { useComparisonAppState } from '@/modules/comparison/app-state';
import { STATISTIC_TEST_CONFIGURATION } from '../statistic-test-config';
import { StatisticTestPurpose } from '../types';
import FetchWrapperComponent from '@/components/utility/fetch-wrapper';
import { Skeleton } from '@mantine/core';

interface StatisticTestResultRendererProps {
  purpose: StatisticTestPurpose;
}

export default function StatisticTestResultRenderer(
  props: StatisticTestResultRendererProps,
) {
  const { purpose } = props;
  const configItem = STATISTIC_TEST_CONFIGURATION[purpose];
  const useDataProvider = configItem.dataProvider;
  const ResultRenderer = configItem.component;
  const currentConfig = useComparisonAppState(
    (store) => store.statisticTest.current,
  );

  if (!configItem) {
    throw new Error(`Statistic test for ${purpose} is not implemented.`);
  }
  const { data, error, loading, refetch } = useDataProvider(currentConfig);

  return (
    <FetchWrapperComponent
      loadingComponent={<Skeleton w="100%" h={720} />}
      isLoading={loading}
      error={error}
      onRetry={refetch}
    >
      <ResultRenderer config={currentConfig} data={data} />
    </FetchWrapperComponent>
  );
}
