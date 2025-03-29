import { TableFilterModel, TableSortModel } from '@/api/table';
import React from 'react';

interface TableFilterStateContextType {
  filter: TableFilterModel | null;
  setFilter: React.Dispatch<React.SetStateAction<TableFilterModel | null>>;
}

interface TableStateContextType {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
}

export const TableStateContext = React.createContext<TableStateContextType>(
  null as any,
);
export const FilterStateContext =
  React.createContext<TableFilterStateContextType>(null as any);

export function FilterStateProvider(props: React.PropsWithChildren) {
  const [filter, setFilter] = React.useState<TableFilterModel | null>(null);
  return (
    <FilterStateContext.Provider value={{ filter, setFilter }}>
      {props.children}
    </FilterStateContext.Provider>
  );
}

export function useTableStateSetup() {
  const [limit, setLimit] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const [sort, setSort] = React.useState<TableSortModel | null>(null);
  const { filter, setFilter } = React.useContext(FilterStateContext);
  return { limit, setLimit, page, setPage, sort, setSort, filter, setFilter };
}
