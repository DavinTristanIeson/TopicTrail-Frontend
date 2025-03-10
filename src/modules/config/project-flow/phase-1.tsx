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
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CheckCircle, PencilSimple } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import Text from '@/components/standard/text';
import RHFField from '@/components/standard/fields';
import GlobalConfig from '@/common/constants/global';
import { client } from '@/common/api/client';
import FormWrapper from '@/components/utility/form/wrapper';
import { invalidateProjectDependencyQueries } from '@/api/project';
import React from 'react';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';

interface ConfigureProjectFlow_CheckProjectIdProps {
  onContinue(): void;
}

const UpdateProjectIdForm = React.forwardRef<
  ParametrizedDisclosureTrigger | null,
  object
>(function UpdateProjectIdForm(props) {
  const { projectId } = props;
  const { mutateAsync: updateProjectId } = client.useMutation(
    'patch',
    '/projects/{project_id}/update-project-id',
    {
      onSuccess(data, variables, context) {
        invalidateProjectDependencyQueries();
      },
    },
  );
  const [newProjectId, setNewProjectId] = React.useState(projectId);
  const [projectId, { close }] = useParametrizedDisclosureTrigger<string>();
  return (
    <Modal
      opened={false}
      onClose={function (): void {
        throw new Error('Function not implemented.');
      }}
    >
      <Modal.Header>
        <Group justify="end">
          <Button
            disabled={newProjectId.length === 0 || newProjectId === projectId}
            onClick={() => {
              updateProjectId({
                body: {
                  project_id: newProjectId,
                },
                params: {
                  path: {
                    project_id: projectId,
                  },
                },
              });
            }}
          >
            Save
          </Button>
        </Group>
      </Modal.Header>
      <Modal.Body></Modal.Body>
    </Modal>
  );
});

interface ProjectIdFormProps {
  disabled?: boolean;
  projectId?: string;
}

export function ProjectIdForm(props: ProjectIdFormProps) {
  return (
    <>
      <RHFField
        type="text"
        name="project_id"
        label="Project Name"
        description="The name of the project should be unique."
        required
        readOnly={props.disabled}
        rightSection={
          props.projectId && props.disabled ? <PencilSimple size={16} /> : null
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
