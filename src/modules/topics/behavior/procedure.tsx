import { client } from '@/common/api/client';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import React from 'react';
import { usePolling } from '@/hooks/polling';
import { showNotification } from '@mantine/notifications';
import { handleError } from '@/common/utils/error';
import { TaskStatusEnum } from '@/common/constants/enum';
import { useTopicAppState } from '../app-state';

function usePeriodicTopicModelingStatusCheck() {
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
  );

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
    data?.status !== TaskStatusEnum.Failed;
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

function useTopicModelingOptions() {
  const {
    current: {
      shouldUseCachedDocumentVectors,
      shouldUseCachedUMAPVectors,
      shouldUseCachedPreprocessedDocuments,
    },
    resetCurrent: resetCurrentTopicModelingOptions,
    setCurrent: setCurrentTopicModelingOptions,
    setState: setTopicModelingOptions,
  } = useTopicAppState((store) => {
    return store.topicModelingOptions;
  });

  const setShouldUseCachedDocumentVectors = React.useCallback(
    (checked: boolean) => {
      setCurrentTopicModelingOptions((prev) => {
        return {
          ...prev,
          shouldUseCachedDocumentVectors: checked,
        };
      });
    },
    [setCurrentTopicModelingOptions],
  );

  const setShouldUseCachedUMAPVectors = React.useCallback(
    (checked: boolean) => {
      setCurrentTopicModelingOptions((prev) => {
        return {
          ...prev,
          shouldUseCachedUMAPVectors: checked,
        };
      });
    },
    [setCurrentTopicModelingOptions],
  );

  const setShouldUseCachedPreprocessedDocuments = React.useCallback(
    (checked: boolean) => {
      setCurrentTopicModelingOptions((prev) => {
        return {
          ...prev,
          shouldUseCachedPreprocessedDocuments: checked,
        };
      });
    },
    [setCurrentTopicModelingOptions],
  );

  return {
    shouldUseCachedDocumentVectors,
    shouldUseCachedUMAPVectors,
    shouldUseCachedPreprocessedDocuments,
    setShouldUseCachedDocumentVectors,
    setShouldUseCachedUMAPVectors,
    setShouldUseCachedPreprocessedDocuments,

    setCurrentTopicModelingOptions,
    setTopicModelingOptions,
    resetCurrentTopicModelingOptions,
  };
}

export function useStartTopicModeling(column: string) {
  const project = React.useContext(ProjectContext);
  const {
    mutateAsync: startTopicModeling,
    isPending: isStartingTopicModeling,
  } = client.useMutation('post', '/topic/{project_id}/start');

  const topicModelingOptions = useTopicModelingOptions();
  const {
    shouldUseCachedDocumentVectors,
    shouldUseCachedUMAPVectors,
    shouldUseCachedPreprocessedDocuments,
  } = topicModelingOptions;
  const urlParams = React.useMemo(() => {
    return {
      use_cached_document_vectors: shouldUseCachedDocumentVectors ? '1' : '0',
      use_cached_umap_vectors: shouldUseCachedUMAPVectors ? '1' : '0',
      use_preprocessed_documents: shouldUseCachedPreprocessedDocuments
        ? '1'
        : '0',
    };
  }, [
    shouldUseCachedDocumentVectors,
    shouldUseCachedUMAPVectors,
    shouldUseCachedPreprocessedDocuments,
  ]);

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
          use_preprocessed_documents: shouldUseCachedPreprocessedDocuments,
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
    shouldUseCachedPreprocessedDocuments,
    shouldUseCachedUMAPVectors,
    startTopicModeling,
  ]);

  return {
    onStartTopicModeling,
    ...topicModelingOptions,
    isStartingTopicModeling,
    urlParams,
  };
}

export default function useTopicModelingActions(column: string) {
  const startActions = useStartTopicModeling(column);
  const { isStartingTopicModeling, onStartTopicModeling: startTopicModeling } =
    startActions;

  const status = usePeriodicTopicModelingStatusCheck();
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
