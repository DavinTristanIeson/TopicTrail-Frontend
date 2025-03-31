import { client } from '@/common/api/client';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import React from 'react';
import { usePolling } from '@/hooks/polling';
import { showNotification } from '@mantine/notifications';
import { handleError } from '@/common/utils/error';
import { TaskStatusEnum } from '@/common/constants/enum';
import { useRouter } from 'next/router';

function usePeriodicTopicModelingStatusCheck(enabled: boolean) {
  const project = React.useContext(ProjectContext);
  const column = React.useContext(SchemaColumnContext);
  const { data, isRefetching, dataUpdatedAt, refetch, error } = client.useQuery(
    'get',
    '/topic/{project_id}/status',
    {
      params: {
        path: {
          project_id: project.id,
        },
        query: {
          column: column.name,
        },
      },
    },
    {
      enabled,
    },
  );

  React.useEffect(() => {
    if (error) {
      showNotification({
        message: error.message,
        color: 'red',
      });
    }
  }, [error]);

  const isStillPolling =
    // Stop when error
    !error &&
    // Data is not success or failed; which means that operation is still in Idle/Pending state.
    data?.status !== TaskStatusEnum.Success &&
    data?.status !== TaskStatusEnum.Failed &&
    // After user has pressed the start topic modeling button
    enabled;
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

export function useStartTopicModeling(column: string) {
  const project = React.useContext(ProjectContext);
  const {
    mutateAsync: startTopicModeling,
    isPending: isStartingTopicModeling,
    data: hasStarted,
  } = client.useMutation('post', '/topic/{project_id}/start');

  const [shouldUseCachedDocumentVectors, setUseCachedDocumentVectors] =
    React.useState(true);
  const [shouldUseCachedUMAPVectors, setUseCachedUMAPVectors] =
    React.useState(true);
  const [shouldUsePreprocessedDocuments, setUsePreprocessedDocuments] =
    React.useState(true);

  const onStartTopicModeling = React.useCallback(async () => {
    try {
      const res = await startTopicModeling({
        params: {
          path: {
            project_id: project.id,
          },
          query: {
            column,
          },
        },
        body: {
          use_cached_document_vectors: shouldUseCachedDocumentVectors,
          use_cached_umap_vectors: shouldUseCachedUMAPVectors,
          use_preprocessed_documents: shouldUsePreprocessedDocuments,
        },
      });
      if (res.message) {
        showNotification({
          message: res.message,
          color: 'green',
        });
      }
    } catch (e) {
      handleError(e);
    }
  }, [
    column,
    project.id,
    shouldUseCachedDocumentVectors,
    shouldUseCachedUMAPVectors,
    shouldUsePreprocessedDocuments,
    startTopicModeling,
  ]);
  return {
    onStartTopicModeling,
    shouldUseCachedDocumentVectors,
    setUseCachedDocumentVectors,
    shouldUseCachedUMAPVectors,
    setUseCachedUMAPVectors,
    shouldUsePreprocessedDocuments,
    setUsePreprocessedDocuments,
    isStartingTopicModeling,
    hasStarted: !!hasStarted,
  };
}

export default function useTopicModelingActions(column: string) {
  const startActions = useStartTopicModeling(column);
  const {
    isStartingTopicModeling,
    hasStarted,
    onStartTopicModeling: startTopicModeling,
  } = startActions;

  const isInitialOngoing = useRouter().query.ongoing === '1';

  const status = usePeriodicTopicModelingStatusCheck(
    !!hasStarted || isInitialOngoing,
  );
  const { checkAgain, isStillPolling } = status;

  const onStartTopicModeling = React.useCallback(async () => {
    await startTopicModeling();
    checkAgain();
  }, [checkAgain, startTopicModeling]);

  return {
    ...status,
    ...startActions,
    onStartTopicModeling,
    startTopicModelingButtonIsLoading:
      isStillPolling || isStartingTopicModeling,
  };
}
