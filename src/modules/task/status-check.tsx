import { TaskResponseModel } from '@/api/topic';
import { TaskStatusEnum } from '@/common/constants/enum';
import { usePolling } from '@/hooks/polling';
import { UseQueryResult } from '@tanstack/react-query';
import React from 'react';

interface UsePeriodicTaskStatusCheckProps<T> {
  query: UseQueryResult<TaskResponseModel<T>, any>;
  isStillPolling?: boolean;
}

export function usePeriodicTaskStatusCheck<T>(
  props: UsePeriodicTaskStatusCheckProps<T>,
) {
  const {
    query: { error, data, refetch, isRefetching, dataUpdatedAt },
    isStillPolling: isControlledStillPolling = true,
  } = props;

  React.useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const isStillPolling =
    // Stop when error
    !error &&
    // Data is not success or failed; which means that operation is still in Idle/Pending state.
    data?.status !== TaskStatusEnum.Success &&
    data?.status !== TaskStatusEnum.Failed &&
    isControlledStillPolling;

  usePolling({
    fn: refetch,
    interval: 5000,
    enabled: isStillPolling,
  });

  return {
    progress: data,
    isCheckingStatus: isRefetching,
    dataUpdatedAt: !data ? undefined : new Date(dataUpdatedAt),
    checkAgain: refetch,
    isStillPolling,
  };
}
