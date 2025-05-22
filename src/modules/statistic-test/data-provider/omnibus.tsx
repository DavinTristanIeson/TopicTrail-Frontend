import { StatisticTestResultModel } from '@/api/statistic-test';
import { BaseStatisticTestDataProviderHook } from '../types';
import { client } from '@/common/api/client';
import {
  usePrepareStatisticTestDataProvider,
  useStatisticTestDataProviderParams,
} from './utils';
import { OmnibusStatisticTestConfig } from '../configuration/omnibus';

const useOmnibusStatisticTestDataProvider: BaseStatisticTestDataProviderHook<
  StatisticTestResultModel,
  OmnibusStatisticTestConfig
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistic-test/{project_id}/omnibus',
    {
      body: {
        column: config.column,
        groups: subdatasets,
        statistic_test_preference: config.statistic_test_preference,
        exclude_overlapping_rows: config.exclude_overlapping_rows,
      },
      params,
    },
  );
  return usePrepareStatisticTestDataProvider({ query });
};
export default useOmnibusStatisticTestDataProvider;
