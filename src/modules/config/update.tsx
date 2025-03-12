import {
  invalidateProjectDependencyQueries,
  ProjectConfigModel,
  ProjectModel,
  CreateProjectInput,
} from '@/api/project';
import { client } from '@/common/api/client';
import NavigationRoutes from '@/common/constants/routes';
import SubmitButton from '@/components/standard/button/submit';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import ProjectConfigForm from '@/modules/config/form';
import { DeleteProjectModal } from '@/modules/project/actions';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import { Button, Divider, Group, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { PencilSimple, TrashSimple, X } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import { ProjectIdForm } from './project-flow/phase-1';
import { ConfigureDataSourceForm } from './project-flow/phase-2';
import { ConfigureColumnsForm } from './project-flow/phase-3';
import ProjectConfigFormPhaseSwitcher from './project-flow';

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
            leftSection={<PencilSimple size={16} />}
            onClick={() => setEditable(true)}
          >
            Edit
          </Button>
          <UpdateProjectDeleteButton />
        </>
      ) : (
        <>
          <SubmitButton>Save Project</SubmitButton>
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
  onSubmit(data: ProjectModel): void;
}

export default function ProjectConfigUpdateForm(
  props: ProjectConfigUpdateFormProps,
) {
  const { data, onSubmit: onAfterSubmit } = props;
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
  const onSubmit = async (input: CreateProjectInput) => {
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
    onAfterSubmit(res.data);
  };
  return (
    <ProjectConfigForm onSubmit={onSubmit} editable={editable} data={data}>
      <Stack>
        <UpdateProjectFormButtons
          editable={editable}
          setEditable={setEditable}
        />
        <ProjectConfigFormPhaseSwitcher hasData />
      </Stack>
    </ProjectConfigForm>
  );
}
