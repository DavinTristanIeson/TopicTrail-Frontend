import { useRouter } from 'next/router';
import ProjectConfigForm from './form';
import ProjectConfigFormPhaseSwitcher from './project-flow';
import { queryClient } from '@/common/api/query-client';
import { client } from '@/common/api/client';
import { ProjectMutationInput } from '@/api/project';
import { showNotification } from '@mantine/notifications';
import { Button, Group, Stack } from '@mantine/core';
import { X } from '@phosphor-icons/react';
import NavigationRoutes from '@/common/constants/routes';

export default function ProjectConfigCreateForm() {
  const { mutateAsync: create } = client.useMutation('post', '/projects/', {
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: client.queryOptions('get', '/projects/').queryKey,
      });
    },
  });
  const router = useRouter();
  const onSubmit = async (input: ProjectMutationInput) => {
    const res = await create({
      body: input,
    });
    if (res.message) {
      showNotification({
        message: res.message,
        color: 'green',
      });
    }
    router.push({
      pathname: NavigationRoutes.ProjectTopics,
      query: {
        id: res.data.id,
      },
    });
  };
  return (
    <ProjectConfigForm onSubmit={onSubmit}>
      <Stack>
        <Group justify="end">
          <Button
            leftSection={<X size={20} />}
            color="red"
            variant="outline"
            onClick={() => {
              router.back();
            }}
          >
            Cancel
          </Button>
        </Group>
        <ProjectConfigFormPhaseSwitcher />
      </Stack>
    </ProjectConfigForm>
  );
}
