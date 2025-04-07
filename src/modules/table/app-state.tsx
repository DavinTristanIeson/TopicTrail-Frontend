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
}

export function useTableStateSetup(): TableStateType {
  const [limit, setLimit] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const [sort, setSort] = React.useState<TableSortModel | null>(null);
  const [filter, setFilter] = React.useState<TableFilterModel | null>(null);

  React.useEffect(() => {
    setPage(0);
  }, [sort, filter, limit]);

  return {
    limit,
    setLimit,
    page,
    setPage,
    sort,
    setSort,
    filter,
    setFilter,
  };
}

interface TableAppStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  params: TableStateType;
  tab: {
    state: TablePageTab;
    setState: React.Dispatch<React.SetStateAction<TablePageTab>>;
  };
}

const TableAppStateContext = createContext<TableAppStateContextType>(
  null as any,
);

export default function TableAppStateProvider(props: React.PropsWithChildren) {
  const [tab, setTab] = React.useState(TablePageTab.Table);
  const tableState = useTableStateSetup();
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);

  return (
    <TableAppStateContext.Provider
      value={{
        tab: {
          state: tab,
          setState: setTab,
        },
        params: tableState,
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
