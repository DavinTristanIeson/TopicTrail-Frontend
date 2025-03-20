import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';
import { TopicModelingResultContext } from '../components/context';
import { usePolling } from '@/hooks/polling';
import { showNotification } from '@mantine/notifications';
import { handleError } from '@/common/utils/error';
import { TaskStatusEnum } from '@/common/constants/enum';

function usePeriodicTopicModelingStatusCheck(enabled: boolean) {
  const project = React.useContext(ProjectContext);
  const { column } = React.useContext(TopicModelingResultContext);
  const { data, isLoading, isFetching, dataUpdatedAt, refetch, error } =
    client.useQuery(
      'get',
      '/topics/{project_id}/status',
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
    isFirstLoading: isLoading && isFetching,
    isSubsequentLoading: isLoading && !isFetching,
    dataUpdatedAt: !data ? undefined : new Date(dataUpdatedAt),
    checkAgain: refetch,
    isStillPolling,
  };
}

export default function useTopicModelingActions(column: string) {
  const project = React.useContext(ProjectContext);
  const {
    mutateAsync: startTopicModeling,
    isPending: isStartingTopicModeling,
    data: hasStarted,
  } = client.useMutation('post', '/topics/{project_id}/start');
  const [shouldUseCachedDocumentVectors, setUseCachedDocumentVectors] =
    React.useState(true);
  const [shouldUseCachedUMAPVectors, setUseCachedUMAPVectors] =
    React.useState(true);
  const [shouldUsePreprocessedDocuments, setUsePreprocessedDocuments] =
    React.useState(true);

  const status = usePeriodicTopicModelingStatusCheck(!!hasStarted);
  const { checkAgain, isStillPolling } = status;
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
      // Manual refetch after isStillPolling has stopped will force the query to run again
      // Which means that status from BE is reset to Pending, and polling resumes.
      checkAgain();
    } catch (e) {
      handleError(e);
    }
  }, [
    checkAgain,
    column,
    project.id,
    shouldUseCachedDocumentVectors,
    shouldUseCachedUMAPVectors,
    shouldUsePreprocessedDocuments,
    startTopicModeling,
  ]);
  return {
    onStartTopicModeling,
    startTopicModelingButtonIsLoading:
      isStillPolling || isStartingTopicModeling,
    setUseCachedDocumentVectors,
    setUseCachedUMAPVectors,
    setUsePreprocessedDocuments,
    ...status,
  };
}
