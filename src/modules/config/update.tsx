import {
  invalidateProjectDependencyQueries,
  ProjectConfigModel,
  ProjectMutationInput,
} from '@/api/project';
import { client } from '@/common/api/client';
import NavigationRoutes from '@/common/constants/routes';
import { DisclosureTrigger } from '@/hooks/disclosure';
import ProjectConfigForm from '@/modules/config/form';
import { DeleteProjectModal } from './delete-modal';
import { ProjectContext } from '@/modules/project/context';
import { Text, Button, Group, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  ArrowCounterClockwise,
  PencilSimple,
  TrashSimple,
} from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import ProjectConfigFormPhaseSwitcher from './project-flow';
import { FormEditableContext } from '@/components/standard/fields/context';
import { CancelButton } from '@/components/standard/button/variants';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { handleErrorFn } from '@/common/utils/error';
import { useResetProjectAppState } from '../project/app-state';

function UpdateProjectDeleteButton() {
  const deleteRemote = React.useRef<DisclosureTrigger | null>(null);
  const router = useRouter();
  const project = React.useContext(ProjectContext);
  return (
    <>
      <DeleteProjectModal
        projectId={project.id}
        projectName={project.config.metadata.name}
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
          deleteRemote.current?.open();
        }}
      >
        Delete Project
      </Button>
    </>
  );
}

function UpdateProjectReloadDatasetButton() {
  const reset = useResetProjectAppState();
  const { mutateAsync: reloadDataset } = client.useMutation(
    'patch',
    '/projects/{project_id}/reload',
    {
      onSuccess(data, variables) {
        reset();
        invalidateProjectDependencyQueries(variables.params.path.project_id);
      },
    },
  );
  const confirmationRemote = React.useRef<DisclosureTrigger | null>(null);
  const project = React.useContext(ProjectContext);
  const router = useRouter();
  return (
    <>
      <ConfirmationDialog
        ref={confirmationRemote}
        dangerous
        title="Reload dataset?"
        icon={<ArrowCounterClockwise />}
        message={
          <Stack>
            <Text inherit>
              <Text fw={500} span inherit>
                Are you sure you want to reload the dataset?
              </Text>{' '}
              This is helpful when your data is corrupted or when you need to
              load the newest data from the dataset as long as the schema of the
              dataset hasn&apos;t changed yet.{' '}
              <Text span inherit c="gray" size="sm">
                If you want to load a dataset with a different schema, please
                change the dataset in Step 2/3 instead.
              </Text>
            </Text>
            <Text inherit>
              Please note that by reloading the dataset, all cached data such as
              the topic modeling results and document vectors{' '}
              <Text inherit span c="red" fw={500}>
                will be deleted
              </Text>{' '}
              because the cached data will become outdated. You will be forced
              to run the topic modeling algorithm again once the dataset has
              been reloaded
            </Text>
          </Stack>
        }
        onConfirm={handleErrorFn(async () => {
          const res = await reloadDataset({
            params: {
              path: {
                project_id: project.id,
              },
            },
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
              id: project.id,
            },
          });
        })}
      />
      <Button
        leftSection={<ArrowCounterClockwise />}
        onClick={() => confirmationRemote.current?.open()}
        color="red"
        variant="outline"
      >
        Reload Dataset
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
          <UpdateProjectReloadDatasetButton />
        </>
      ) : (
        <>
          <CancelButton
            onClick={() => {
              setEditable(false);
            }}
          >
            Cancel
          </CancelButton>
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
      onSuccess(data, variables) {
        invalidateProjectDependencyQueries(variables.params.path.project_id);
      },
    },
  );

  const reset = useResetProjectAppState();
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
    reset();
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
