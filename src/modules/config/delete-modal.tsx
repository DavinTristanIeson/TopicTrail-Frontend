import { removeProjectDependencyQueries } from '@/api/project';
import { client } from '@/common/api/client';
import { handleErrorFn } from '@/common/utils/error';
import { CancelButton } from '@/components/standard/button/variants';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Modal, Stack, Flex, Button, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TrashSimple } from '@phosphor-icons/react';
import React from 'react';

interface DeleteProjectModalProps {
  onAfterDelete?(): void;
  projectId: string;
  projectName: string;
}
export const DeleteProjectModal = React.forwardRef<
  DisclosureTrigger | null,
  DeleteProjectModalProps
>(function DeleteProjectModal(props, ref) {
  const { onAfterDelete, projectId, projectName } = props;
  const [opened, { close }] = useDisclosureTrigger(ref);
  const { mutateAsync, isPending } = client.useMutation(
    'delete',
    '/projects/{project_id}',
    {
      onSuccess(data, variables) {
        removeProjectDependencyQueries(variables.params.path.project_id);
      },
    },
  );
  return (
    <Modal opened={opened} onClose={close} title="Delete Project" centered>
      {projectId && (
        <Stack gap={32}>
          <Text>
            Are you sure you want to delete{' '}
            <Text fw="bold" span>
              {projectName}
            </Text>
            ?{' '}
            <Text fw="bold" span c="red">
              This action is irreversible!
            </Text>
          </Text>
          <Flex direction="row-reverse" gap={12}>
            <Button
              color="red"
              leftSection={<TrashSimple />}
              loading={isPending}
              onClick={handleErrorFn(async () => {
                const res = await mutateAsync({
                  params: {
                    path: {
                      project_id: projectId,
                    },
                  },
                });
                if (res.message) {
                  showNotification({
                    message: res.message,
                    color: 'green',
                  });
                }
                onAfterDelete?.();
                close();
              })}
            >
              Delete Project
            </Button>
            <CancelButton onClick={close} />
          </Flex>
        </Stack>
      )}
    </Modal>
  );
});
