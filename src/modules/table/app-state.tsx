import { DashboardItemModel } from '@/api/userdata';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

import { TableFilterModel, TableSortModel } from '@/api/table';

export enum TablePageTab {
  Table = 'table',
  Dashboard = 'dashboard',
}

export interface TableStateType {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
  filter: TableFilterModel | null;
  setFilter: React.Dispatch<React.SetStateAction<TableFilterModel | null>>;
  reset(): void;
}

export function useTableStateSetup(): TableStateType {
  const [limit, setLimit] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const [sort, setSort] = React.useState<TableSortModel | null>(null);
  const [filter, setFilter] = React.useState<TableFilterModel | null>(null);

  React.useEffect(() => {
    setPage(0);
  }, [sort, filter, limit]);

  const reset = React.useCallback(() => {
    setLimit(25);
    setPage(0);
    setSort(null);
    setFilter(null);
  }, []);

  return React.useMemo(() => {
    return {
      limit,
      setLimit,
      page,
      setPage,
      sort,
      setSort,
      filter,
      setFilter,
      reset,
    };
  }, [filter, limit, page, reset, sort]);
}

interface TableAppStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  params: TableStateType;
  tab: TablePageTab;
  setTab: React.Dispatch<React.SetStateAction<TablePageTab>>;
  reset(): void;
}

const TableAppStateContext = createContext<TableAppStateContextType>(
  null as any,
);

export default function TableAppStateProvider(props: React.PropsWithChildren) {
  const [tab, setTab] = React.useState(TablePageTab.Table);
  const tableState = useTableStateSetup();
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);
  const { reset: resetTableState } = tableState;
  const { setState: setDashboard } = dashboardHandlers;
  const reset = React.useCallback(() => {
    resetTableState();
    setDashboard([]);
  }, [resetTableState, setDashboard]);

  return (
    <TableAppStateContext.Provider
      value={{
        tab,
        setTab,
        params: tableState,
        reset,
        dashboard: {
          state: dashboard,
          handlers: dashboardHandlers,
        },
      }}
    >
      {props.children}
    </TableAppStateContext.Provider>
  );
}

export function useTableAppState<T>(
  selector: (store: TableAppStateContextType) => T,
) {
  return useContextSelector(TableAppStateContext, selector);
}
