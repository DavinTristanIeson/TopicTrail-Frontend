import { SchemaColumnModel } from '@/api/project';
import { PaginationMetaModel } from '@/api/table';
import React from 'react';
import { DataTable, useDataTableColumns } from 'mantine-datatable';
import {
  useSchemaColumnToMantineDataGridAdapter,
  useTableStateToMantineDataGridAdapter,
} from './adapter';
import { LocalStorageKeys } from '@/common/constants/browser-storage-keys';
import { Button, Group, Stack, Indicator } from '@mantine/core';
import { ArrowClockwise, Funnel } from '@phosphor-icons/react';
import { TableStateContext } from './context';
import TableFilterDrawer from '../filter/drawer';
import { DisclosureTrigger } from '@/hooks/disclosure';

function TableFilterButton() {
  const tableFilterRemote = React.useRef<DisclosureTrigger | null>(null);
  const { filter, setFilter } = React.useContext(TableStateContext);
  return (
    <Indicator disabled={!filter} color="red" zIndex={2}>
      <TableFilterDrawer
        ref={tableFilterRemote}
        filter={filter}
        setFilter={setFilter}
      />
      <Button
        variant="outline"
        onClick={() => {
          tableFilterRemote.current?.open();
        }}
        leftSection={<Funnel />}
      >
        Filter
      </Button>
    </Indicator>
  );
}

interface TableRendererComponentProps {
  columns: SchemaColumnModel[] | undefined;
  data: Record<string, any>[] | undefined;
  meta: PaginationMetaModel | undefined;
  isFetching: boolean;
}

export default function TableRendererComponent(
  props: TableRendererComponentProps,
) {
  const { data, columns, meta, isFetching } = props;
  const dataTableColumns = useSchemaColumnToMantineDataGridAdapter(
    columns ?? [],
  );
  const tableStateProps = useTableStateToMantineDataGridAdapter({ meta });
  const {
    effectiveColumns,
    resetColumnsToggle,
    resetColumnsOrder,
    resetColumnsWidth,
  } = useDataTableColumns({
    key: LocalStorageKeys.TableColumnStates,
    columns: dataTableColumns,
  });

  return (
    <Stack>
      <Group justify="end">
        <Button
          onClick={() => {
            resetColumnsToggle();
            resetColumnsOrder();
            resetColumnsWidth();
          }}
          leftSection={<ArrowClockwise />}
        >
          Reset Column States
        </Button>
        <TableFilterButton />
      </Group>
      <DataTable
        records={data}
        columns={effectiveColumns}
        withTableBorder
        withColumnBorders
        highlightOnHover
        height={720}
        width={720}
        fetching={isFetching}
        loaderType="dots"
        {...tableStateProps}
      />
    </Stack>
  );
}
