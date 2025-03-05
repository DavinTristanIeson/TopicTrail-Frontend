import SubmitButton from '@/components/standard/button/submit';
import { Accordion, Stack, Title, Flex, Button } from '@mantine/core';
import { FloppyDisk, ArrowLeft } from '@phosphor-icons/react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { ConfigureDataSourceForm } from './phase-2';
import { ProjectIdForm } from './phase-1';
import { ProjectConfigColumnFormItem } from '../columns/form-body';
import React from 'react';

function ProjectConfigColumnsFieldArray() {
  const { control } = useFormContext<ProjectConfigFormType>();
  const { fields } = useFieldArray({
    name: 'columns',
    control,
    keyName: '__fieldId',
  });

  return (
    <Accordion>
      {fields.map((field, index) => {
        return (
          <ProjectConfigColumnFormItem
            index={index}
            key={field.__fieldId}
            accordionValue={field.__fieldId}
          />
        );
      })}
    </Accordion>
  );
}

interface ProjectConfigFormBodyProps {
  onBack?(): void;
}

export default function ProjectConfigFormBody(
  props: ProjectConfigFormBodyProps,
) {
  return (
    <Stack>
      <Title order={2}>3/3: Project Configuration</Title>
      <ProjectIdForm disabled />

      <Title order={4}>Dataset</Title>
      <ConfigureDataSourceForm disabled />

      <Title order={4}>Schema</Title>
      <ProjectConfigColumnsFieldArray />

      <Flex justify="space-between" direction="row-reverse" align="center">
        <SubmitButton leftSection={<FloppyDisk size={20} />}>
          Save Project
        </SubmitButton>
        <Button
          leftSection={<ArrowLeft size={20} />}
          variant="outline"
          onClick={props.onBack}
        >
          Change Dataset?
        </Button>
      </Flex>
    </Stack>
  );
}
