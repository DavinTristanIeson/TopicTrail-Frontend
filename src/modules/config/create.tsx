import { useRouter } from 'next/router';
import ProjectConfigForm from './form';
import ProjectConfigFormPhaseSwitcher from './project-flow';
import { queryClient } from '@/common/api/query-client';
import { client } from '@/common/api/client';
import { ProjectMutationInput } from '@/api/project';
import { showNotification } from '@mantine/notifications';
import { Group, Stack } from '@mantine/core';
import NavigationRoutes from '@/common/constants/routes';
import { DisclosureTrigger } from '@/hooks/disclosure';
import React from 'react';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { CancelButton } from '@/components/standard/button/variants';

export default function ProjectConfigCreateForm() {
  const { mutateAsync: create } = client.useMutation('post', '/projects/', {
    onSuccess() {
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

  const confirmRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <ConfirmationDialog
        message="Are you sure you want to go back? This will abort the project creation process and all of the values you inputted will be lost."
        onConfirm={async () => {
          router.back();
        }}
        positiveAction="Go Back"
        ref={confirmRemote}
      />
      <ProjectConfigForm onSubmit={onSubmit}>
        <Stack>
          <Group justify="end">
            <CancelButton
              onClick={() => {
                confirmRemote.current?.open();
              }}
            >
              Cancel
            </CancelButton>
          </Group>
          <ProjectConfigFormPhaseSwitcher />
        </Stack>
      </ProjectConfigForm>
    </>
  );
}
