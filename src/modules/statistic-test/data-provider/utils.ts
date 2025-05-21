import { useComparisonAppState } from '@/modules/comparison/app-state';
import { ProjectContext } from '@/modules/project/context';
import { UseQueryResult } from '@tanstack/react-query';
import React from 'react';

interface UseStatisticTestDataProviderPropsProps {
  groups: string[] | null;
}

export function useStatisticTestDataProviderParams(
  props: UseStatisticTestDataProviderPropsProps,
) {
  const { groups } = props;
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const subdatasets = React.useMemo(() => {
    if (groups == null) {
      return comparisonGroups;
    }
    console.log(groups);
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
  }, [comparisonGroups, groups]);
  const project = React.useContext(ProjectContext);
  return {
    subdatasets,
    params: {
      path: {
        project_id: project.id,
      },
    },
  };
}

interface UsePrepareStatisticTestDataProviderProps<T> {
  query: UseQueryResult<{ data: T }, { message: string }>;
}

export function usePrepareStatisticTestDataProvider<T>(
  props: UsePrepareStatisticTestDataProviderProps<T>,
) {
  const { query } = props;
  return {
    data: query.data?.data,
    loading: query.isFetching,
    error: query.error?.message,
    refetch: query.refetch,
  };
}
