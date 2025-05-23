import { client } from '@/common/api/client';
import { SubdatasetCooccurrenceModel } from '@/api/comparison';
import { BaseStatisticTestDataProviderHook } from '../types';
import {
  usePrepareStatisticTestDataProvider,
  useStatisticTestDataProviderParams,
} from './utils';

export const useStatisticTestSubdatasetCooccurrenceDataProvider: BaseStatisticTestDataProviderHook<
  SubdatasetCooccurrenceModel,
  object
> = function () {
  const { params, subdatasets } = useStatisticTestDataProviderParams({
    groups: null,
  });
  // Exclude default subdataset
  const groups = subdatasets.filter((group) => !!group.filter);
  const query = client.useQuery(
    'post',
    '/statistic-test/{project_id}/co-occurrence',
    {
      body: {
        groups: groups,
      },
      params,
    },
  );

  return usePrepareStatisticTestDataProvider({
    query,
  });
};
