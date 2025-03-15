import {
  PaginationMetaModel,
  TableFilterModel,
  TablePaginationApiResult,
  TableSortModel,
} from '@/api/table';
import { client } from '@/common/api/client';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { ProjectContext } from '@/modules/project/context';
import {
  Text,
  ActionIcon,
  Alert,
  Group,
  Indicator,
  Pagination,
  Stack,
  Select,
  Button,
  Loader,
} from '@mantine/core';
import { Eye, Funnel, Warning } from '@phosphor-icons/react';
import React from 'react';
import TableFilterDrawer from '../filter';
import pick from 'lodash/pick';
import TableRendererComponent from './renderer';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import TableColumnStatesDrawer, {
  TableColumnState,
} from './column-order-drawer';

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
  }, []);

  if (columns.length === 0) {
    return (
      <Alert icon={<Warning size={20} />} title="No Columns?" color="red">
        Oops, there doesn't seem to be any columns in your dataset. Either this
        is because our local copy of the dataset file has been corrupted in some
        way, or because you accidentally hid every single available column in
        the "Sort Columns" drawer.
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

interface TablePaginatorProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  meta: PaginationMetaModel;
}

function TablePaginator(props: TablePaginatorProps) {
  const { meta, page, limit, setPage, setLimit } = props;

  return (
    <Group justify="space-between" align="end">
      <Text c="gray">{`Showing ${page * limit + 1} - ${Math.min(meta.total, (page + 1) * limit)} out of ${meta.total} rows`}</Text>
      <Pagination
        total={meta.pages}
        value={page + 1}
        onChange={(page) => setPage(page - 1)}
        hideWithOnePage
      />
      <Group>
        <Text c="gray" size="sm">
          Rows per page
        </Text>
        <Select
          value={limit.toString()}
          onChange={(value) => setLimit(value == null ? 25 : parseInt(value))}
          allowDeselect={false}
          data={[15, 25, 50, 100].map(String)}
          maw={80}
        />
      </Group>
    </Group>
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
          project_id: project?.id!,
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

  if (!project) {
    return null;
  }
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
        loadingComponent={
          <div className="min-h-3xl flex items-center justify-center">
            <Loader type="dots" size={48} />
          </div>
        }
      >
        {(data) => (
          <TablePreprocessor
            columnStates={columnStates}
            result={data}
            setSort={setSort}
            sort={sort}
            Bottom={
              <TablePaginator
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
