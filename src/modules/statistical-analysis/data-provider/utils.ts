import {
  useCheckComparisonSubdatasetsVisibility,
  useComparisonAppState,
} from '@/modules/comparison/app-state';
import { ProjectContext } from '@/modules/project/context';
import { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import { MultinomialRegressionDependentVariableMode } from '../configuration/multinomial-regression';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import { identity } from 'lodash-es';

interface UseStatisticalAnalysisDataProviderPropsProps {
  groups: string[] | null;
}

export function useStatisticalAnalysisDataProviderParams(
  props: UseStatisticalAnalysisDataProviderPropsProps,
) {
  const { groups } = props;
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const { onlyVisible } = useCheckComparisonSubdatasetsVisibility();
  const subdatasets = React.useMemo(() => {
    if (groups == null) {
      return onlyVisible(comparisonGroups.filter((group) => !!group.filter));
    }
    return groups.map((group) => {
      const foundSubdataset = comparisonGroups.find(
        (subdataset) => subdataset.name === group,
      );
      if (!foundSubdataset) {
        throw new Error(
          `The subdataset named ${group} no longer exists. Please choose a different subdataset.`,
        );
      }
      return foundSubdataset;
    });
  }, [comparisonGroups, groups, onlyVisible]);
  const project = React.useContext(ProjectContext);
  return {
    subdatasets,
    params: {
      path: {
        project_id: project.id,
      },
    },
    queryConfig: {},
  };
}

interface UsePrepareStatisticalAnalysisDataProviderProps<T> {
  query: UseQueryResult<{ data: T }, { message: string }>;
}

export function usePrepareStatisticalAnalysisDataProvider<T>(
  props: UsePrepareStatisticalAnalysisDataProviderProps<T>,
) {
  const { query } = props;

  return {
    data: query.data?.data,
    loading: query.isFetching,
    error: query.error?.message,
    refetch: query.refetch,
  };
}
