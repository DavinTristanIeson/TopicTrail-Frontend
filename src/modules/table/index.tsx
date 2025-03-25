import {
  TableFilterModel,
  TablePaginationApiResult,
  TableSortModel,
} from '@/api/table';
import { client } from '@/common/api/client';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { ProjectContext } from '@/modules/project/context';
import { Alert, Group, Indicator, Stack, Button } from '@mantine/core';
import { Eye, Funnel, Warning } from '@phosphor-icons/react';
import React from 'react';
import TableFilterDrawer from '@/modules/filter/drawer';
import pick from 'lodash/pick';
import TableRendererComponent from './renderer';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import TableColumnStatesDrawer, {
  TableColumnState,
} from './actions/column-states-drawer';
import { TableSkeleton } from '@/components/visual/loading';
import TablePagination from '@/components/widgets/pagination';

interface TablePreprocessorProps {
  columnStates: TableColumnState[] | null;
  result: TablePaginationApiResult;
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
  Bottom?: React.ReactNode;
}

function TablePreprocessor(props: TablePreprocessorProps) {
  const { result, columnStates: columnStates, sort, setSort, Bottom } = props;
  const { data, columns } = React.useMemo(() => {
    if (!columnStates) {
      return {
        data: result.data,
        columns: result.columns,
      };
    }
    const columns = columnStates
      .filter((column) => column.visible)
      .map((column) => result.columns.find((col) => col.name === column.name)!)
      .filter(Boolean);
    const availableColumnKeys = columns.map((column) => column.name);
    const data = result.data.map((row) => pick(row, availableColumnKeys));
    return { data, columns };
  }, [columnStates, result.columns, result.data]);

  if (columns.length === 0) {
    return (
      <Alert icon={<Warning size={20} />} title="No Columns?" color="red">
        Oops, there doesn&apos;t seem to be any columns in your dataset. Either
        this is because our local copy of the dataset file has been corrupted in
        some way, or because you accidentally hid every single available column
        in the &quot;Column States&quot; drawer.
      </Alert>
    );
  }
  if (data.length === 0) {
    return (
      <Alert icon={<Warning size={20} />} title="No Rows?" color="red">
        Oops, there doesn&apos;t seem to be any rows in this sub-dataset. Your
        filter may be too strict. Consider changing the filter in the
        &quot;Filter&quot; drawer.
      </Alert>
    );
  }
  return (
    <Stack>
      <TableRendererComponent
        columns={columns}
        data={data}
        sort={sort}
        setSort={setSort}
      />
      {Bottom}
    </Stack>
  );
}

export default function TableQueryComponent() {
  const project = React.useContext(ProjectContext);
  const [limit, setLimit] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const [sort, setSort] = React.useState<TableSortModel | null>(null);
  const [filter, setFilter] = React.useState<TableFilterModel | null>(null);
  const [columnStates, setColumnStates] = React.useState<
    TableColumnState[] | null
  >(null);
  const query = client.useQuery(
    'post',
    '/table/{project_id}/',
    {
      params: {
        path: {
          project_id: project.id,
        },
      },
      body: {
        limit,
        page,
        sort,
        filter,
      },
    },
    {
      enabled: !!project,
    },
  );
  const tableFilterRemote = React.useRef<DisclosureTrigger | null>(null);
  const tableColumnStatesRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <>
      <TableFilterDrawer
        ref={tableFilterRemote}
        filter={filter}
        setFilter={setFilter}
      />
      <TableColumnStatesDrawer
        columnStates={columnStates}
        columns={query.data?.columns ?? []}
        setColumnStates={setColumnStates}
        ref={tableColumnStatesRemote}
      />
      <Group justify="end" className="pb-3">
        <Indicator disabled={!columnStates} color="red" zIndex={2}>
          <Button
            variant="outline"
            onClick={() => tableColumnStatesRemote.current?.open()}
            leftSection={<Eye />}
          >
            Column States
          </Button>
        </Indicator>
        <Indicator disabled={!filter} color="red" zIndex={2}>
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
      </Group>
      <UseQueryWrapperComponent
        query={query}
        loadingComponent={<TableSkeleton />}
      >
        {(data) => (
          <TablePreprocessor
            columnStates={columnStates}
            result={data}
            setSort={setSort}
            sort={sort}
            Bottom={
              <TablePagination
                setLimit={setLimit}
                setPage={setPage}
                limit={limit}
                page={page}
                meta={data.meta}
              />
            }
          />
        )}
      </UseQueryWrapperComponent>
    </>
  );
}
