import { ContingencyTableModel } from '@/api/statistical-analysis';
import { BaseStatisticalAnalysisDataProviderHook } from '../types';
import { client } from '@/common/api/client';
import {
  usePrepareStatisticalAnalysisDataProvider,
  useStatisticalAnalysisDataProviderParams,
} from './utils';
import { ContingencyTableConfig } from '../configuration/contingency-table';
import { SubdatasetCooccurrenceModel } from '@/api/comparison';

export const useContingencyTableStatisticTestDataProvider: BaseStatisticalAnalysisDataProviderHook<
  ContingencyTableModel,
  ContingencyTableConfig
> = function (config) {
  const { subdatasets, params } = useStatisticalAnalysisDataProviderParams({
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
  return usePrepareStatisticalAnalysisDataProvider({ query });
};

export const useStatisticTestSubdatasetCooccurrenceDataProvider: BaseStatisticalAnalysisDataProviderHook<
  SubdatasetCooccurrenceModel,
  object
> = function () {
  const { params, subdatasets } = useStatisticalAnalysisDataProviderParams({
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

  return usePrepareStatisticalAnalysisDataProvider({
    query,
  });
};
