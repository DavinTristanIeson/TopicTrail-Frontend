// +------------------+
// | CHECK PROJECT ID |
// +------------------+

import { useCheckProjectId } from '@/api/project';
import Colors from '@/common/constants/colors';
import { handleFormSubmission } from '@/common/utils/form';
import { TextField } from '@/components/standard/fields/wrapper';
import { Stack, LoadingOverlay, Title, Flex, Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CheckCircle } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import Text from '@/components/standard/text';

interface ConfigureProjectFlow_CheckProjectIdProps {
  onContinue(): void;
}

interface ProjectIdFormProps {
  disabled?: boolean;
}

export function ProjectIdForm(props: ProjectIdFormProps) {
  return (
    <TextField
      name="projectId"
      label="Project Name"
      description="The name of the project should be unique."
      required
      disabled={props.disabled}
    />
  );
}

export function ConfigureProjectFlow_CheckProjectId(
  props: ConfigureProjectFlow_CheckProjectIdProps,
) {
  const { mutateAsync: check, isPending } = useCheckProjectId();
  const {
    getValues,
    setError,
    formState: { errors },
  } = useFormContext<ProjectConfigFormType>();
  const handleSubmit = handleFormSubmission(async () => {
    const values = getValues();
    const res = await check({
      projectId: values.projectId,
    });
    if (res.message) {
      showNotification({
        message: res.message,
        color: Colors.sentimentSuccess,
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
        <Text c={Colors.foregroundPrimary} span>
          data
        </Text>{' '}
        directory in the same directory as the Wordsmith Project.
      </Text>
      <ProjectIdForm disabled={isPending} />
      <Flex direction="row-reverse" w="100%">
        <Button
          leftSection={<CheckCircle size={20} />}
          onClick={handleSubmit}
          disabled={!!errors.projectId}
          loading={isPending}
        >
          Check Project Name
        </Button>
      </Flex>
    </Stack>
  );
}
