import { ProjectMutationInput } from '@/api/project';
import { client } from '@/common/api/client';
import { queryClient } from '@/common/api/query-client';
import NavigationRoutes from '@/common/constants/routes';
import { handleErrorFn } from '@/common/utils/error';
import { Button, Group } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Download } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';

export interface ImportProjectSubmitButtonProps {
  getImportPayload(): Promise<ProjectMutationInput | undefined>;
  disabled: boolean;
}

export interface ImportProjectFormComponentProps {
  ImportButton: React.FC<ImportProjectSubmitButtonProps>;
}

interface UseDefaultImportProjectSubmitButtonProps {
  onClose(): void;
}

export function useDefaultImportProjectSubmitButton(
  props: UseDefaultImportProjectSubmitButtonProps,
) {
  const { onClose } = props;
  const {
    mutateAsync: createProject,
    error,
    isPending,
  } = client.useMutation('post', '/projects/', {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: client.queryOptions('get', '/projects/').queryKey,
      });
    },
  });
  const { push: routerPush } = useRouter();

  const ImportButton = React.useCallback(
    (props: ImportProjectSubmitButtonProps) => {
      const { getImportPayload, disabled } = props;
      const handleImport = handleErrorFn(async () => {
        const payload = await getImportPayload();
        if (!payload) return;
        const res = await createProject({
          body: payload,
        });
        if (res.message) {
          showNotification({
            message: res.message,
            color: 'green',
          });
        }
        routerPush({
          pathname: NavigationRoutes.ProjectTopics,
          query: {
            id: res.data.id,
          },
        });
        onClose();
      });
      return (
        <Group justify="end">
          <Button
            leftSection={<Download />}
            disabled={disabled || isPending}
            onClick={handleImport}
          >
            Import Project
          </Button>
        </Group>
      );
    },
    [createProject, isPending, onClose, routerPush],
  );

  return { ImportButton, error };
}
