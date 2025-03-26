import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import {
  type DataTableSortStatus,
  type DataTableColumn,
} from 'mantine-datatable';
import React from 'react';
import { ColumnCellRenderer } from './cell';
import { PaginationMetaModel } from '@/api/table';
import { TableStateContext } from './context';
import { LocalStorageKeys } from '@/common/constants/browser-storage-keys';

const SORTABLE_COLUMNS = [
  SchemaColumnTypeEnum.OrderedCategorical,
  SchemaColumnTypeEnum.Continuous,
  SchemaColumnTypeEnum.Geospatial,
  SchemaColumnTypeEnum.Temporal,
];

type SchemaColumnDataTableColumnType = DataTableColumn<Record<string, any>>;
export function useSchemaColumnToMantineDataGridAdapter(
  columns: SchemaColumnModel[],
): SchemaColumnDataTableColumnType[] {
  return React.useMemo<SchemaColumnDataTableColumnType[]>(() => {
    const tableColumns = columns.map<SchemaColumnDataTableColumnType>(
      (column) => {
        return {
          accessor: column.name,
          title: column.name,
          width: 200,
          resizable: true,
          toggleable: true,
          draggable: true,
          sortable: SORTABLE_COLUMNS.includes(
            column.type as SchemaColumnTypeEnum,
          ),
          render(data) {
            return (
              <ColumnCellRenderer column={column} value={data[column.name]} />
            );
          },
        };
      },
    );
    return tableColumns;
  }, [columns]);
}

interface UseTableStateToMantineDataGridAdapterProps {
  meta: PaginationMetaModel | undefined;
}

export function useTableStateToMantineDataGridAdapter(
  props: UseTableStateToMantineDataGridAdapterProps,
) {
  const { meta } = props;
  const { sort, setSort, page, setPage, limit, setLimit } =
    React.useContext(TableStateContext);
  return {
    sortStatus: sort
      ? ({
          columnAccessor: sort.name,
          direction: sort.asc ? ('asc' as const) : ('desc' as const),
        } as DataTableSortStatus<Record<string, any>>)
      : (undefined as any),
    onSortStatusChange: React.useCallback(
      (sortStatus: DataTableSortStatus<Record<string, any>>) => {
        setSort(
          sortStatus
            ? {
                name: sortStatus.columnAccessor,
                asc: sortStatus.direction === 'asc',
              }
            : null,
        );
      },
      [setSort],
    ),
    storeColumnsKey: LocalStorageKeys.TableColumnStates,
    totalRecords: meta?.total,
    recordsPerPage: limit,
    onRecordsPerPageChange: setLimit,
    recordsPerPageOptions: [10, 25, 50, 100],
    page: page + 1,
    onPageChange: React.useCallback(
      (page: number) => setPage(page - 1),
      [setPage],
    ),
    idAccessor: '__index',
  };
}
