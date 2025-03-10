import {
  Paper,
  Group,
  ActionIcon,
  Modal,
  Stack,
  Flex,
  Title,
  Button,
} from '@mantine/core';
import Text from '@/components/standard/text';
import React from 'react';
import { Eye, PencilSimple, TrashSimple, X } from '@phosphor-icons/react';
import Colors from '@/common/constants/colors';
import {
  invalidateProjectDependencyQueries,
  ProjectLiteModel,
} from '@/api/project';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { handleErrorFn } from '@/common/utils/error';
import { showNotification } from '@mantine/notifications';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import { client } from '@/common/api/client';

interface ProjectListItemProps extends ProjectLiteModel {}

export function ProjectListItem(props: ProjectListItemProps) {
  const router = useRouter();
  return (
    <Paper
      shadow="xs"
      w="100%"
      p="md"
      className="flex justify-between align-start hover:bg-gray-50 cursor-pointer"
      onClick={() => {
        router.push({
          pathname: NavigationRoutes.Project,
          query: {
            id: props.id,
          },
        });
      }}
    >
      <div className="flex-1">
        <Text>{props.id}</Text>
        <Text c="gray">{`from ${props.path}`}</Text>
      </div>
      <Group gap={12}>
        <Eye size={24} color={Colors.foregroundPrimary} />
        <ActionIcon
          variant="subtle"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            router.push({
              pathname: NavigationRoutes.ProjectConfiguration,
              query: {
                id: props.id,
              },
            });
          }}
          size="lg"
        >
          <PencilSimple size={24} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}

interface DeleteProjectModalProps {
  onAfterDelete?(): void;
}

export const DeleteProjectModal = React.forwardRef<
  ParametrizedDisclosureTrigger<string> | null,
  DeleteProjectModalProps
>(function DeleteProjectModal(props, ref) {
  const { onAfterDelete } = props;
  const { mutateAsync, isPending } = client.useMutation(
    'delete',
    '/projects/{project_id}',
    {
      onSuccess(data, variables, context) {
        invalidateProjectDependencyQueries();
      },
    },
  );
  const [data, { close }] = useParametrizedDisclosureTrigger(ref);
  return (
    <Modal
      opened={!!data}
      onClose={close}
      title={<Title order={2}>Delete Project</Title>}
      centered
    >
      {data && (
        <Modal.Body>
          <Stack gap={32}>
            <Text>
              Are you sure you want to delete{' '}
              <Text fw="bold" span>
                {data}
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
                        project_id: data,
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
              <Button
                variant="outline"
                color="gray"
                leftSection={<X />}
                onClick={close}
              >
                Cancel
              </Button>
            </Flex>
          </Stack>
        </Modal.Body>
      )}
    </Modal>
  );
});
