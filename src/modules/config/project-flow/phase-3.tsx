import SubmitButton from '@/components/standard/button/submit';
import {
  Stack,
  Title,
  Flex,
  Button,
  Table,
  Skeleton,
  Alert,
  TableScrollContainer,
  Spoiler,
  Tabs,
  Group,
  Tooltip,
} from '@mantine/core';
import { ArrowLeft, Warning } from '@phosphor-icons/react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { ProjectConfigColumnFormItem } from '../columns/form-body';
import React from 'react';
import { client } from '@/common/api/client';
import { transformDataSourceFormType2DataSourceInput } from '../columns/utils';
import Text from '@/components/standard/text';
import { useWatchFieldError } from '@/components/standard/fields/watcher';
import { ProjectSchemaTypeIcon } from '@/components/widgets/project-schema-icon';

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

  return (
    <Tabs value={value} onChange={setValue}>
      <Tabs.List>
        {fields.map((field, index) => (
          <Tabs.Tab key={field.__fieldId} value={field.__fieldId}>
            <ProjectConfigColumnTitle name={field.name} index={index} />
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {fields.map((field, index) => {
        return (
          <Tabs.Panel key={field.__fieldId} value={field.__fieldId}>
            {field.__fieldId === value && (
              <ProjectConfigColumnFormItem index={index} />
            )}
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
}

function ProjectConfigPreviewTable() {
  const { control } = useFormContext<ProjectConfigFormType>();
  const source = useWatch({
    name: 'source',
    control,
  });
  const {
    data: preview,
    isFetching,
    error,
  } = client.useQuery('post', '/projects/dataset_preview', {
    body: transformDataSourceFormType2DataSourceInput(source),
  });
  if (isFetching) {
    return (
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 15 }, (_, i) => (
          <Skeleton height={32} key={i} />
        ))}
      </div>
    );
  }
  const data = preview?.data;
  if (error) {
    return (
      <Alert icon={<Warning size={20} />} color="red" title="No Preview">
        We cannot provide a preview of the dataset right now due to the
        following error. {error?.message}
      </Alert>
    );
  }
  if (!data) {
    return null;
  }
  return (
    <Spoiler
      hideLabel={'Hide Dataset Preview'}
      showLabel="Show Dataset Preview"
    >
      <TableScrollContainer minWidth={500}>
        <Table>
          <Table.Tr>
            {data.dataset_columns.map((col) => (
              <Table.Th key={col}>{col}</Table.Th>
            ))}
          </Table.Tr>
          {data.preview_rows.map((row, idx) => (
            <Table.Tr key={idx}>
              {data.dataset_columns.map((col) => (
                <Table.Td key={col}>{row[col]}</Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table>
      </TableScrollContainer>
      {data.total_rows > 15 && (
        <Text ta="center" className="w-full" color="gray">
          And {data.total_rows - 15} more rows...
        </Text>
      )}
    </Spoiler>
  );
}

export function ConfigureColumnsForm() {
  return (
    <>
      <Stack className="pt-5">
        <Title order={4} ta="center">
          Dataset Preview
        </Title>
        <ProjectConfigPreviewTable />
      </Stack>
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
        <SubmitButton>
          {hasData ? 'Save Project' : 'Create Project'}
        </SubmitButton>
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
