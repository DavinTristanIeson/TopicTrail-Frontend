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

const SORTABLE_COLUMNS = [
  SchemaColumnTypeEnum.OrderedCategorical,
  SchemaColumnTypeEnum.Continuous,
  SchemaColumnTypeEnum.Geospatial,
  SchemaColumnTypeEnum.Temporal,
];

type SchemaColumnDataTableColumnType = MRT_ColumnDef<Record<string, any>>;
export function useSchemaColumnToMantineReactTableAdapter(
  columns: SchemaColumnModel[],
): SchemaColumnDataTableColumnType[] {
  return React.useMemo<SchemaColumnDataTableColumnType[]>(() => {
    const tableColumns = columns.map<SchemaColumnDataTableColumnType>(
      (column) => {
        return {
          accessorKey: column.name,
          header: column.name,
          minWidth: 150,
          enableSorting: SORTABLE_COLUMNS.includes(
            column.type as SchemaColumnTypeEnum,
          ),
          Cell({ cell: { getValue } }) {
            return <ColumnCellRenderer column={column} value={getValue()} />;
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
): Partial<MRT_TableOptions<Record<string, any>>> {
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
    enableSorting: false,
    enableMultiSort: false,
    manualSorting: true,
    enableSortingRemoval: true,
    sortDescFirst: false,
    state: {
      sorting: tableSortStateArray,
      pagination: tablePaginationState,
      isLoading: isFetching,
    },
    mantinePaginationProps: {
      rowsPerPageOptions: [10, 25, 50, 100].map(String),
    },
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

    enablePagination: true,
    manualPagination: true,
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
    pageCount: meta?.pages ?? -1,
  };
}
