import { DatasetPreviewModel } from '@/api/table';
import { client } from '@/common/api/client';
import { LocalStorageKeys } from '@/common/constants/browser-storage-keys';
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
import { Warning } from '@phosphor-icons/react';
import {
  type DataTableColumn,
  useDataTableColumns,
  DataTable,
} from 'mantine-datatable';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { transformDataSourceFormType2DataSourceInput } from '../columns/utils';
import { ProjectConfigFormType } from '../form-type';

function ProjectConfigPreviewTable(props: DatasetPreviewModel) {
  const { dataset_columns, preview_rows, total_rows } = props;
  const dataTableColumns = React.useMemo(() => {
    return dataset_columns.map<DataTableColumn<Record<string, any>>>(
      (column) => {
        return {
          accessor: column,
          title: column,
          width: 200,
          resizable: true,
        };
      },
    );
  }, [dataset_columns]);

  const { effectiveColumns, resetColumnsWidth } = useDataTableColumns({
    key: LocalStorageKeys.DatasetTablePreviewStates,
    columns: dataTableColumns,
  });

  const hasAcknowledgedResetWidth = React.useRef(false);
  React.useEffect(() => {
    if (hasAcknowledgedResetWidth.current) {
      return;
    }
    resetColumnsWidth();
    hasAcknowledgedResetWidth.current = true;
  }, [resetColumnsWidth]);

  const [opened, { toggle }] = useDisclosure();

  return (
    <Stack>
      <Button onClick={toggle} fullWidth variant="subtle">
        Show Dataset Preview
      </Button>
      <Collapse in={opened}>
        <Title order={4} ta="center">
          Dataset Preview
        </Title>
        <DataTable
          columns={effectiveColumns}
          records={preview_rows as Record<string, any>[]}
          withTableBorder
          withColumnBorders
          highlightOnHover
          height={500}
          width={720}
          storeColumnsKey={LocalStorageKeys.DatasetTablePreviewStates}
        />
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

  return <ProjectConfigPreviewTable {...data} />;
}
