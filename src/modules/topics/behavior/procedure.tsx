import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';
import { showNotification } from '@mantine/notifications';
import { handleError } from '@/common/utils/error';
import { useTopicAppState } from '../app-state';
import { usePeriodicTaskStatusCheck } from '@/modules/task/status-check';
import { queryClient } from '@/common/api/query-client';

function usePeriodicTopicModelingStatusCheck() {
  const project = React.useContext(ProjectContext);
  const column = useTopicAppState((store) => store.column)!;
  const query = client.useQuery('get', '/topic/{project_id}/status', {
    params: {
      path: {
        project_id: project.id,
      },
      query: {
        column: column.name,
      },
    },
  });
  return usePeriodicTaskStatusCheck({
    query: query,
  });
}

function useTopicModelingOptions() {
  const {
    shouldUseCachedDocumentVectors,
    shouldUseCachedUMAPVectors,
    shouldUseCachedPreprocessedDocuments,
  } = useTopicAppState((store) => store.topicModelingOptions.current);
  const resetCurrentTopicModelingOptions = useTopicAppState(
    (store) => store.topicModelingOptions.resetCurrent,
  );
  const setCurrentTopicModelingOptions = useTopicAppState(
    (store) => store.topicModelingOptions.setCurrent,
  );
  const setTopicModelingOptions = useTopicAppState(
    (store) => store.topicModelingOptions.setState,
  );

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
      queryClient.removeQueries({
        queryKey: [
          client.queryOptions('get', '/topic/{project_id}/status', {
            params: {
              path: {
                project_id: project.id,
              },
              query: {
                column: column,
              },
            },
          }),
        ],
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
