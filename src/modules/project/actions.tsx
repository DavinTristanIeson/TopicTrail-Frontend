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
import { Eye, TrashSimple, X } from '@phosphor-icons/react';
import Colors from '@/common/constants/colors';
import { ProjectLiteModel } from '@/api/project/model';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { useDeleteProject } from '@/api/project';
import { handleErrorFn } from '@/common/utils/error';
import { showNotification } from '@mantine/notifications';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';

interface ProjectListItemProps extends ProjectLiteModel {
  onDelete(id: string): void;
}

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
        <Text c={Colors.foregroundDull}>{`from ${props.path}`}</Text>
      </div>
      <Group gap={12}>
        <Eye size={24} color={Colors.foregroundPrimary} />
        <ActionIcon
          variant="subtle"
          onClick={(e) => {
            props.onDelete(props.id);
            e.stopPropagation();
            e.preventDefault();
          }}
          color={Colors.sentimentError}
          size="lg"
        >
          <TrashSimple size={24} />
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
  const { mutateAsync, isPending } = useDeleteProject();
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
              <Text fw="bold" span c={Colors.sentimentError}>
                This action is irreversible!
              </Text>
            </Text>
            <Flex direction="row-reverse" gap={12}>
              <Button
                color={Colors.sentimentError}
                leftSection={<TrashSimple />}
                loading={isPending}
                onClick={handleErrorFn(async () => {
                  const res = await mutateAsync({
                    id: data,
                  });
                  if (res.message) {
                    showNotification({
                      message: res.message,
                      color: Colors.sentimentSuccess,
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
                color={Colors.foregroundDull}
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
