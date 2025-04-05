import { DatasetPreviewModel } from '@/api/table';
import { client } from '@/common/api/client';
import {
  Text,
  Stack,
  Button,
  Collapse,
  Title,
  Skeleton,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Warning, EyeSlash, Eye } from '@phosphor-icons/react';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { ProjectDataSourceModel } from '@/api/project';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';

function ProjectConfigPreviewTable(props: DatasetPreviewModel) {
  const { dataset_columns, preview_rows, total_rows } = props;
  const tableColumns = React.useMemo(() => {
    return dataset_columns.map<MRT_ColumnDef<Record<string, any>>>((column) => {
      return {
        accessorKey: column,
        header: column,
        size: 200,
        Cell({ cell: { getValue } }) {
          return <div className="h-full">{getValue() as React.ReactNode}</div>;
        },
      };
    });
  }, [dataset_columns]);

  const table = useMantineReactTable({
    data: preview_rows,
    columns: tableColumns,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    ...MantineReactTableBehaviors.Virtualized(preview_rows, dataset_columns),
    mantineTableContainerProps: {
      mah: 500,
    },
  });

  const [opened, { toggle }] = useDisclosure();

  return (
    <Stack>
      <Button
        onClick={toggle}
        fullWidth
        variant="subtle"
        leftSection={opened ? <EyeSlash /> : <Eye />}
      >
        {opened ? 'Hide' : 'Show'} Dataset Preview
      </Button>
      <Collapse in={opened}>
        <Title order={4} ta="center">
          Dataset Preview
        </Title>
        <MantineReactTable table={table} />
        {total_rows > 15 && (
          <Text ta="center" className="w-full" color="gray">
            And {total_rows - 15} more rows...
          </Text>
        )}
      </Collapse>
    </Stack>
  );
}

export function ProjectConfigPreviewTableQuery() {
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
    body: source as ProjectDataSourceModel,
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

  return <ProjectConfigPreviewTable {...data} />;
}
