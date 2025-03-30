import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import React from 'react';
import { ColumnCellRenderer } from './cell';
import { PaginationMetaModel } from '@/api/table';
import { TableStateContext } from './context';
import {
  type MRT_TableOptions,
  type MRT_ColumnDef,
  type MRT_SortingState,
  type MRT_Updater,
  type MRT_PaginationState,
} from 'mantine-react-table';
import { Text, HoverCard } from '@mantine/core';

const SORTABLE_COLUMNS = [
  SchemaColumnTypeEnum.OrderedCategorical,
  SchemaColumnTypeEnum.Continuous,
  SchemaColumnTypeEnum.Geospatial,
  SchemaColumnTypeEnum.Temporal,
];

const DEFAULT_COLUMN_SIZES = {
  [SchemaColumnTypeEnum.Categorical]: 200,
  [SchemaColumnTypeEnum.Continuous]: 150,
  [SchemaColumnTypeEnum.Geospatial]: 150,
  [SchemaColumnTypeEnum.MultiCategorical]: 300,
  [SchemaColumnTypeEnum.OrderedCategorical]: 200,
  [SchemaColumnTypeEnum.Temporal]: 200,
  [SchemaColumnTypeEnum.Textual]: 400,
  [SchemaColumnTypeEnum.Topic]: 150,
  [SchemaColumnTypeEnum.Unique]: 300,
};

export type SchemaColumnDataTableColumnType = MRT_ColumnDef<
  Record<string, any>
>;

type MantineReactTableProps = Partial<MRT_TableOptions<any>>;

export const MantineReactTableStylingProps = {};

export const MantineReactTableBehaviors = {
  Default: {
    mantineTableProps: {
      stickyHeader: true,
      withTableBorder: true,
      withColumnBorders: true,
    },
    enableFilters: false,
    enableStickyHeader: true,
    enableGlobalFilter: false,
  } satisfies MantineReactTableProps,
  Resizable: {
    enableColumnResizing: true,
    layoutMode: 'grid-no-grow',
    columnResizeMode: 'onEnd',
  } satisfies MantineReactTableProps,
  Sortable: {
    enableSorting: false,
    enableMultiSort: false,
    manualSorting: true,
    enableSortingRemoval: true,
    sortDescFirst: false,
  } satisfies MantineReactTableProps,
  WithPagination: {
    mantinePaginationProps: {
      rowsPerPageOptions: [10, 25, 50, 100].map(String),
    },
    enablePagination: true,
    manualPagination: true,
  } satisfies MantineReactTableProps,
  ColumnActions: {
    enableColumnDragging: true,
    enableColumnOrdering: true,
    enableColumnFilters: false,
    enableColumnPinning: true,
    enableColumnResizing: true,
  } satisfies MantineReactTableProps,
  Virtualized(rows: any[], columns: any[]) {
    return {
      enableColumnVirtualization: columns.length > 12,
      enableRowVirtualization: rows.length > 50,
    } satisfies MantineReactTableProps;
  },
};

export function useSchemaColumnToMantineReactTableAdapter(
  columns: SchemaColumnModel[],
): SchemaColumnDataTableColumnType[] {
  return React.useMemo<SchemaColumnDataTableColumnType[]>(() => {
    const tableColumns = columns.map<SchemaColumnDataTableColumnType>(
      (column: SchemaColumnModel) => {
        return {
          accessorKey: column.name,
          header: column.name,
          Header() {
            if (!column.description) {
              return column.name;
            }
            return (
              <HoverCard>
                <HoverCard.Target>
                  <Text fw="bold" size="sm">
                    {column.name}
                  </Text>
                </HoverCard.Target>
                <HoverCard.Dropdown className="max-w-md">
                  <Text size="sm">{column.description}</Text>
                </HoverCard.Dropdown>
              </HoverCard>
            );
          },
          size: DEFAULT_COLUMN_SIZES[column.type as SchemaColumnTypeEnum],
          enableSorting: SORTABLE_COLUMNS.includes(
            column.type as SchemaColumnTypeEnum,
          ),
          Cell({ cell: { getValue } }) {
            return (
              <div className="h-full">
                <ColumnCellRenderer column={column} value={getValue()} />
              </div>
            );
          },
        };
      },
    );
    return tableColumns;
  }, [columns]);
}

interface UseTableStateToMantineReactTableAdapterProps {
  meta: PaginationMetaModel | undefined;
  isFetching: boolean;
}

export function useTableStateToMantineReactTableAdapter(
  props: UseTableStateToMantineReactTableAdapterProps,
): Partial<MRT_TableOptions<any>> {
  const { meta, isFetching } = props;
  const { sort, setSort, page, setPage, limit, setLimit } =
    React.useContext(TableStateContext);

  const tableSortStateArray: MRT_SortingState = React.useMemo(() => {
    return sort
      ? [
          {
            id: sort.name,
            desc: sort.asc,
          },
        ]
      : [];
  }, [sort]);

  const tablePaginationState: MRT_PaginationState = React.useMemo(() => {
    return {
      pageIndex: page,
      pageSize: limit,
    };
  }, [limit, page]);

  return {
    ...MantineReactTableBehaviors.Sortable,
    ...MantineReactTableBehaviors.WithPagination,
    state: {
      sorting: tableSortStateArray,
      pagination: tablePaginationState,
      isLoading: isFetching,
    },
    pageCount: meta?.pages,
    rowCount: meta?.total,
    onSortingChange: React.useCallback(
      (state: MRT_Updater<MRT_SortingState>) => {
        let newSortStateArray: MRT_SortingState;
        if (typeof state === 'function') {
          newSortStateArray = state(tableSortStateArray);
        } else {
          newSortStateArray = state;
        }

        if (newSortStateArray.length === 0) {
          setSort(null);
        } else {
          const newSortState = newSortStateArray[0]!;
          setSort({
            asc: !newSortState.desc,
            name: newSortState.id,
          });
        }
      },
      [setSort, tableSortStateArray],
    ),
    onPaginationChange: React.useCallback(
      (state: MRT_Updater<MRT_PaginationState>) => {
        let newPagination: MRT_PaginationState;
        if (typeof state === 'function') {
          newPagination = state(tablePaginationState);
        } else {
          newPagination = state;
        }
        setPage(newPagination.pageIndex);
        setLimit(newPagination.pageSize);
      },
      [setLimit, setPage, tablePaginationState],
    ),
  };
}
