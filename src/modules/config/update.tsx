import {
  invalidateProjectDependencyQueries,
  ProjectConfigModel,
  ProjectMutationInput,
} from '@/api/project';
import { client } from '@/common/api/client';
import NavigationRoutes from '@/common/constants/routes';
import SubmitButton from '@/components/standard/button/submit';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import ProjectConfigForm from '@/modules/config/form';
import { DeleteProjectModal } from '@/modules/project/actions';
import { ProjectContext } from '@/modules/project/context';
import { Button, Group, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { PencilSimple, TrashSimple, X } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import ProjectConfigFormPhaseSwitcher from './project-flow';
import { FormEditableContext } from '@/components/standard/fields/context';

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
          router.replace(NavigationRoutes.Home);
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

interface UpdateProjectFormButtonsProps {
  editable: boolean;
  setEditable: React.Dispatch<React.SetStateAction<boolean>>;
}

function UpdateProjectFormButtons(props: UpdateProjectFormButtonsProps) {
  const { editable, setEditable } = props;
  return (
    <Group justify="end">
      {!editable ? (
        <>
          <Button
            leftSection={<PencilSimple />}
            onClick={() => setEditable(true)}
          >
            Edit
          </Button>
          <UpdateProjectDeleteButton />
        </>
      ) : (
        <>
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
        </>
      )}
    </Group>
  );
}

interface ProjectConfigUpdateFormProps {
  data: ProjectConfigModel;
}

export default function ProjectConfigUpdateForm(
  props: ProjectConfigUpdateFormProps,
) {
  const { data } = props;
  const [editable, setEditable] = React.useState(false);
  const router = useRouter();
  const projectId = router.query.id as string;
  const { mutateAsync: update } = client.useMutation(
    'put',
    '/projects/{project_id}',
    {
      onSuccess(data, variables, context) {
        invalidateProjectDependencyQueries(variables.params.path.project_id);
      },
    },
  );
  const onSubmit = async (input: ProjectMutationInput) => {
    const res = await update({
      params: {
        path: {
          project_id: projectId,
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
    router.replace({
      pathname: NavigationRoutes.ProjectTopics,
      query: {
        id: projectId,
      },
    });
  };

  const editableProviderValue = React.useMemo(() => {
    return { editable, setEditable };
  }, [editable]);
  return (
    <FormEditableContext.Provider value={editableProviderValue}>
      <ProjectConfigForm onSubmit={onSubmit} data={data}>
        <Stack>
          <UpdateProjectFormButtons
            editable={editable}
            setEditable={setEditable}
          />
          <ProjectConfigFormPhaseSwitcher hasData />
        </Stack>
      </ProjectConfigForm>
    </FormEditableContext.Provider>
  );
}
