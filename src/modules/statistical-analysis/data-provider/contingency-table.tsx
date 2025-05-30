import { ContingencyTableModel } from '@/api/statistical-analysis';
import { BaseStatisticTestDataProviderHook } from '../types';
import { client } from '@/common/api/client';
import {
  usePrepareStatisticTestDataProvider,
  useStatisticTestDataProviderParams,
} from './utils';
import { ContingencyTableConfig } from '../configuration/contingency-table';
import { SubdatasetCooccurrenceModel } from '@/api/comparison';

export const useContingencyTableStatisticTestDataProvider: BaseStatisticTestDataProviderHook<
  ContingencyTableModel,
  ContingencyTableConfig
> = function (config) {
  const { subdatasets, params } = useStatisticTestDataProviderParams({
    groups: null,
  });
  const query = client.useQuery(
    'post',
    '/statistical-analysis/{project_id}/contingency-table',
    {
      body: {
        column: config.column,
        groups: subdatasets,
        exclude_overlapping_rows: config.exclude_overlapping_rows,
      },
      params,
    },
  );
  return usePrepareStatisticTestDataProvider({ query });
};

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
    '/statistical-analysis/{project_id}/co-occurrence',
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
