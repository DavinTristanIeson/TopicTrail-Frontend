import { STATISTIC_TEST_CONFIGURATION } from '../statistic-test-config';
import { StatisticTestStateItem, StatisticTestPurpose } from '../types';
import FetchWrapperComponent from '@/components/utility/fetch-wrapper';
import { Skeleton } from '@mantine/core';

interface StatisticTestResultRendererProps {
  purpose: StatisticTestPurpose;
  input: StatisticTestStateItem;
}

export default function StatisticTestResultRenderer(
  props: StatisticTestResultRendererProps,
) {
  const { purpose, input } = props;
  const configItem = STATISTIC_TEST_CONFIGURATION[purpose];
  const useDataProvider = configItem.dataProvider;
  const ResultRenderer = configItem.component;

  if (!configItem) {
    throw new Error(`Statistic test for ${purpose} is not implemented.`);
  }
  const { data, error, loading, refetch } = useDataProvider(input.config);

  return (
    <FetchWrapperComponent
      loadingComponent={<Skeleton w="100%" h={720} />}
      isLoading={loading}
      error={error}
      onRetry={refetch}
    >
      <ResultRenderer config={input.config} data={data} />
    </FetchWrapperComponent>
  );
}
