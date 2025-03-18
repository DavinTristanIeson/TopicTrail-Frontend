// +------------------+
// | CHECK PROJECT ID |
// +------------------+

import { Stack, Title, Flex, Button, Tooltip, Text } from '@mantine/core';
import { ArrowRight } from '@phosphor-icons/react';
import { useFormState } from 'react-hook-form';
import RHFField from '@/components/standard/fields';
import GlobalConfig from '@/common/constants/global';
import React from 'react';
import { ProjectConfigFormType } from '../form-type';

interface ConfigureProjectFlow_CheckProjectIdProps {
  onContinue(): void;
}

export function ProjectConfigMetadataFormBody() {
  return (
    <Stack className="max-w-xl">
      <RHFField
        type="text"
        name="metadata.name"
        label="Project Name"
        description={`The name of the project. Note that the project name will be different from the name of the project folder in the "data" folder.`}
        required
      />
      <RHFField
        type="tags"
        name="metadata.tags"
        label="Project Tags"
        description="Tags or keywords that will be used to help classify this project."
      />
      <RHFField
        type="textarea"
        name="metadata.description"
        label="Project Description"
        rows={4}
      />
    </Stack>
  );
}

export function ConfigureProjectFlow_CheckProjectId(
  props: ConfigureProjectFlow_CheckProjectIdProps,
) {
  const { onContinue } = props;
  const { errors } = useFormState<ProjectConfigFormType>({
    name: 'metadata.name',
  });
  const isError = !!errors.metadata;
  return (
    <Stack className="relative">
      <Title order={2}>1/3: What&apos;s the name of your project?</Title>
      <Text className="break-words text-wrap">
        First things first, please specify the name of your project. Note that
        your project can be found in the{' '}
        <Text c="brand" span>
          data
        </Text>{' '}
        directory in the same directory as {GlobalConfig.AppName}.
      </Text>
      <ProjectConfigMetadataFormBody />
      <Flex direction="row-reverse" w="100%">
        <Tooltip
          disabled={!isError}
          color="red"
          label="There are still errors in the form."
        >
          <Button
            rightSection={<ArrowRight />}
            onClick={onContinue}
            disabled={isError}
          >
            Next
          </Button>
        </Tooltip>
      </Flex>
    </Stack>
  );
}
