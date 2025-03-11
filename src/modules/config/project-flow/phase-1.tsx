// +------------------+
// | CHECK PROJECT ID |
// +------------------+

import { handleFormSubmission } from '@/common/utils/form';
import {
  Stack,
  LoadingOverlay,
  Title,
  Flex,
  Button,
  Modal,
  Group,
  ActionIcon,
  TextInput,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CheckCircle, PencilSimple, X } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import Text from '@/components/standard/text';
import RHFField from '@/components/standard/fields';
import GlobalConfig from '@/common/constants/global';
import { client } from '@/common/api/client';
import { invalidateProjectDependencyQueries } from '@/api/project';
import React from 'react';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import Colors from '@/common/constants/colors';

interface ConfigureProjectFlow_CheckProjectIdProps {
  onContinue(): void;
}

const UpdateProjectIdForm = React.forwardRef<
  ParametrizedDisclosureTrigger<string> | null,
  object
>(function UpdateProjectIdForm(props, ref) {
  const { mutateAsync: updateProjectId, error } = client.useMutation(
    'patch',
    '/projects/{project_id}/update-project-id',
    {
      onSuccess(data, variables, context) {
        invalidateProjectDependencyQueries();
      },
    },
  );
  const [projectId, { close }] = useParametrizedDisclosureTrigger<string>(ref);
  const [newProjectId, setNewProjectId] = React.useState(projectId);
  React.useEffect(() => {
    setNewProjectId(projectId);
  }, [projectId]);
  return (
    <Modal opened={!!projectId} onClose={close} title="Update Project Name">
      <Modal.Header>
        <Group justify="end">
          <Button
            disabled={
              !newProjectId ||
              newProjectId.length === 0 ||
              newProjectId === projectId
            }
            leftSection={<CheckCircle size={16} />}
            onClick={() => {
              if (!newProjectId || !projectId) return;
              updateProjectId({
                body: {
                  project_id: newProjectId,
                },
                params: {
                  path: {
                    project_id: projectId!,
                  },
                },
              });
            }}
          >
            Change Project Name
          </Button>
          <Button onClick={close} leftSection={<X size={16} />}>
            Cancel
          </Button>
        </Group>
      </Modal.Header>
      <Modal.Body>
        <TextInput
          value={newProjectId}
          onChange={(e) => setNewProjectId(e.target.value)}
          error={error?.message}
          label="New Project Name"
          description="The name of the project should be a valid and unique file name."
        />
      </Modal.Body>
    </Modal>
  );
});

interface ProjectIdFormProps {
  disabled?: boolean;
  projectId?: string;
}

export function ProjectIdForm(props: ProjectIdFormProps) {
  const { projectId, disabled } = props;
  const {
    formState: { disabled: formDisabled },
  } = useFormContext();
  const projectIdRemote =
    React.useRef<ParametrizedDisclosureTrigger<string> | null>(null);
  return (
    <>
      <UpdateProjectIdForm ref={projectIdRemote} />
      <RHFField
        type="text"
        name="project_id"
        label="Project Name"
        description="The name of the project should be a valid and unique file name."
        required
        readOnly={disabled || formDisabled}
        rightSection={
          projectId && (disabled || formDisabled) ? (
            <ActionIcon
              variant="subtle"
              color={Colors.sentimentInfo}
              onClick={() => {
                projectIdRemote.current?.open(projectId);
              }}
            >
              <PencilSimple size={16} />
            </ActionIcon>
          ) : null
        }
      />
    </>
  );
}

export function ConfigureProjectFlow_CheckProjectId(
  props: ConfigureProjectFlow_CheckProjectIdProps,
) {
  const { mutateAsync: check, isPending } = client.useMutation(
    'post',
    '/projects/check-project-id',
  );
  const {
    getValues,
    setError,
    formState: { errors },
  } = useFormContext<ProjectConfigFormType>();
  const handleSubmit = handleFormSubmission(async () => {
    const values = getValues();
    const res = await check({
      body: {
        project_id: values.project_id,
      },
    });
    if (res.message) {
      showNotification({
        message: res.message,
        color: 'green',
      });
    }
    props.onContinue();
  }, setError);

  return (
    <Stack className="relative">
      <LoadingOverlay
        visible={isPending}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Title order={2}>1/3: What&apos;s the name of your project?</Title>
      <Text wrap>
        First things first, please specify the name of your project. Note that
        your project can be found in the{' '}
        <Text c="brand" span>
          data
        </Text>{' '}
        directory in the same directory as {GlobalConfig.AppName}.
      </Text>
      <ProjectIdForm disabled={isPending} />
      <Flex direction="row-reverse" w="100%">
        <Button
          leftSection={<CheckCircle size={20} />}
          onClick={handleSubmit}
          disabled={!!errors.project_id}
          loading={isPending}
        >
          Check Project Name
        </Button>
      </Flex>
    </Stack>
  );
}
