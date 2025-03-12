import {
  Paper,
  Group,
  ActionIcon,
  Modal,
  Stack,
  Flex,
  Title,
  Button,
  Badge,
  Spoiler,
} from '@mantine/core';
import Text from '@/components/standard/text';
import React from 'react';
import { Eye, PencilSimple, TrashSimple, X } from '@phosphor-icons/react';
import Colors from '@/common/constants/colors';
import {
  invalidateProjectDependencyQueries,
  ProjectModel,
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

interface ProjectListItemProps extends ProjectModel {}

export function ProjectListItem(props: ProjectListItemProps) {
  const router = useRouter();
  const metadata = props.config.metadata;
  return (
    <Paper shadow="xs" p="md" className="w-full">
      <div>
        <Group justify="between">
          <div className="flex-1">
            <Text>{metadata.name}</Text>
            <Text
              c="gray"
              className="text-wrap"
              size="sm"
            >{`from ${props.path}`}</Text>
            <Group wrap="wrap" gap={4} className="pt-2">
              {metadata.tags?.map((tag) => (
                <Badge color="brand" variant="light" radius="sm">
                  {tag}
                </Badge>
              ))}
            </Group>
          </div>
          <Group gap={12}>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => {
                router.push({
                  pathname: NavigationRoutes.Project,
                  query: {
                    id: props.id,
                  },
                });
              }}
            >
              <Eye size={24} color={Colors.foregroundPrimary} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              onClick={(e) => {
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
        </Group>
        {!!metadata.description && (
          <Text size="sm" className="pt-2">
            {metadata.description}
          </Text>
        )}
      </div>
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
  const [projectId, { close }] = useParametrizedDisclosureTrigger(ref);
  const { mutateAsync, isPending } = client.useMutation(
    'delete',
    '/projects/{project_id}',
    {
      onSuccess(data, variables, context) {
        invalidateProjectDependencyQueries(variables.params.path.project_id);
      },
    },
  );
  return (
    <Modal opened={!!projectId} onClose={close} title="Delete Project" centered>
      {projectId && (
        <Stack gap={32}>
          <Text>
            Are you sure you want to delete{' '}
            <Text fw="bold" span>
              {projectId}
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
      )}
    </Modal>
  );
});
