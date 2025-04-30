import SubmitButton from '@/components/standard/button/submit';
import {
  Stack,
  Title,
  Flex,
  Button,
  Tabs,
  Group,
  Tooltip,
  Text,
} from '@mantine/core';
import { ArrowLeft, Warning } from '@phosphor-icons/react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { ProjectConfigColumnFormItem } from '../columns/form-body';
import React from 'react';
import { useWatchFieldError } from '@/components/standard/fields/watcher';
import { ProjectSchemaTypeIcon } from '@/components/widgets/project-schema-icon';
import { ProjectConfigPreviewTableQuery } from './preview-table';
import { FormEditableContext } from '@/components/standard/fields/context';
import { DefaultErrorViewBoundary } from '@/components/visual/error';

interface ProjectConfigColumnTitleProps {
  index: number;
  name: string;
}

function ProjectConfigColumnTitle(props: ProjectConfigColumnTitleProps) {
  const { index, name } = props;
  const { control } = useFormContext<ProjectConfigFormType>();

  const parentName = `columns.${index}` as const;
  const type = useWatch({
    name: `${parentName}.type`,
    control,
  });
  const error = useWatchFieldError(parentName);
  return (
    <Group>
      {error && (
        <Tooltip label={error} radius="sm" color="red">
          <Warning color="red" />
        </Tooltip>
      )}
      {type && <ProjectSchemaTypeIcon type={type} />}
      <Text fw="bold" size="md">
        {name}
      </Text>
    </Group>
  );
}

function ProjectConfigColumnsFieldArray() {
  const { control } = useFormContext<ProjectConfigFormType>();
  const { fields } = useFieldArray({
    name: 'columns',
    control,
    keyName: '__fieldId',
  });
  const [value, setValue] = React.useState<string | null>(
    fields[0]?.__fieldId ?? null,
  );

  const activeIndex = fields.findIndex((field) => field.__fieldId === value);

  return (
    <>
      <Tabs value={value} onChange={setValue} allowTabDeactivation={false}>
        <Tabs.List>
          {fields.map((field, index) => (
            <Tabs.Tab key={field.__fieldId} value={field.__fieldId}>
              <ProjectConfigColumnTitle name={field.name} index={index} />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <DefaultErrorViewBoundary>
        {activeIndex != -1 && (
          <ProjectConfigColumnFormItem index={activeIndex} key={activeIndex} />
        )}
      </DefaultErrorViewBoundary>
    </>
  );
}

export function ConfigureColumnsForm() {
  return (
    <>
      <ProjectConfigPreviewTableQuery />
      <Stack>
        <Title order={4} ta="center">
          Column Configuration
        </Title>
        <ProjectConfigColumnsFieldArray />
      </Stack>
      <div style={{ height: 160 }} />
    </>
  );
}

interface ProjectConfigFormBodyProps {
  onBack?(): void;
  hasData?: boolean;
}

export default function ConfigureProjectFlow_ConfigureColumns(
  props: ProjectConfigFormBodyProps,
) {
  const { hasData } = props;
  const { editable } = React.useContext(FormEditableContext);
  return (
    <Stack>
      <Title order={2}>3/3: Project Configuration</Title>
      <Text>
        Finally, configure the schema of your dataset. The types will determine
        the analysis methods that will be used for each column. Please note that
        the application assumes that the columns of the dataset will never
        change; which means you will not be allowed to change the columns after
        creating a new project. Make sure that unnecessary columns have already
        been removed from your dataset.
      </Text>
      <Flex justify="space-between" direction="row-reverse" align="center">
        {editable && (
          <SubmitButton>
            {hasData ? 'Save Project' : 'Create Project'}
          </SubmitButton>
        )}
        {props.onBack && (
          <Button
            leftSection={<ArrowLeft size={20} />}
            variant="outline"
            onClick={props.onBack}
          >
            Change Dataset?
          </Button>
        )}
      </Flex>
      <ConfigureColumnsForm />
    </Stack>
  );
}
