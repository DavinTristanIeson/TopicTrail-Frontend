import { invalidateProjectDependencyQueries } from '@/api/project';
import { client } from '@/common/api/client';
import NavigationRoutes from '@/common/constants/routes';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import ProjectConfigForm from '@/modules/config';
import { DeleteProjectModal } from '@/modules/project/actions';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import { Button, Divider, Group } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { PencilSimple, TrashSimple, X } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';

function UpdateProjectDeleteButton() {
  const deleteRemote =
    React.useRef<ParametrizedDisclosureTrigger<string> | null>(null);
  const router = useRouter();
  const project = React.useContext(ProjectContext);
  return (
    <>
      <DeleteProjectModal
        ref={deleteRemote}
        onAfterDelete={() => {
          router.replace(NavigationRoutes.Dashboard);
        }}
      />
      <Button
        variant="outline"
        leftSection={<TrashSimple />}
        color="red"
        onClick={() => {
          if (!project?.id) return;
          deleteRemote.current?.open(project.id);
        }}
      >
        Delete Project
      </Button>
    </>
  );
}

function UpdateProjectPageContent() {
  const [editable, setEditable] = React.useState(false);
  const { mutateAsync: update } = client.useMutation(
    'put',
    '/projects/{project_id}',
    {
      onSuccess(data, variables, context) {
        invalidateProjectDependencyQueries();
      },
    },
  );
  const router = useRouter();
  const data = React.useContext(ProjectContext);
  if (!data) return;

  return (
    <>
      <Group justify="end">
        {!editable ? (
          <>
            <Button
              leftSection={<PencilSimple size={16} />}
              onClick={() => setEditable(true)}
            >
              Edit
            </Button>
            <UpdateProjectDeleteButton />
          </>
        ) : (
          <Button
            variant="outline"
            color="red"
            leftSection={<X />}
            onClick={() => {
              setEditable(false);
            }}
          >
            Cancel
          </Button>
        )}
      </Group>
      <Divider />
      <ProjectConfigForm
        data={data.config}
        editable={editable}
        onSubmit={async (input) => {
          const res = await update({
            params: {
              path: {
                project_id: router.query.id as string,
              },
            },
            body: input,
          });
          if (res.message) {
            showNotification({
              message: res.message,
              color: 'green',
            });
          }
          router.back();
        }}
      />
    </>
  );
}

export default function UpdateProjectPage() {
  return (
    <AppProjectLayout>
      <UpdateProjectPageContent />
    </AppProjectLayout>
  );
}
