import SubmitButton from '@/components/standard/button/submit';
import {
  Accordion,
  Stack,
  Title,
  Flex,
  Button,
  Table,
  Skeleton,
  Divider,
  Alert,
  ScrollArea,
  TableScrollContainer,
  Spoiler,
} from '@mantine/core';
import { FloppyDisk, ArrowLeft, Warning } from '@phosphor-icons/react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { ConfigureDataSourceForm } from './phase-2';
import { ProjectIdForm } from './phase-1';
import { ProjectConfigColumnFormItem } from '../columns/form-body';
import React from 'react';
import { client } from '@/common/api/client';
import { transformDataSourceFormType2DataSourceInput } from '../columns/utils';
import Text from '@/components/standard/text';

function ProjectConfigColumnsFieldArray() {
  const { control } = useFormContext<ProjectConfigFormType>();
  const { fields } = useFieldArray({
    name: 'columns',
    control,
    keyName: '__fieldId',
  });
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <Accordion value={value} onChange={setValue}>
      {fields.map((field, index) => {
        return (
          <ProjectConfigColumnFormItem
            index={index}
            key={field.__fieldId}
            accordionValue={field.__fieldId}
            opened={field.__fieldId === value}
          />
        );
      })}
    </Accordion>
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
      <div className="grid grid-cols-5">
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
          {data.preview_rows.map((row) => (
            <Table.Tr>
              {data.dataset_columns.map((col) => (
                <Table.Td>{row[col]}</Table.Td>
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
      <ConfigureDataSourceForm disabled />

      <ProjectConfigPreviewTable />

      <ProjectConfigColumnsFieldArray />

      <Flex justify="space-between" direction="row-reverse" align="center">
        <SubmitButton leftSection={<FloppyDisk size={20} />}>
          Save Project
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
    </Stack>
  );
}
