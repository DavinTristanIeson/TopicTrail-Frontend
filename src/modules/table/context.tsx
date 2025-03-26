import { TableFilterModel, TableSortModel } from '@/api/table';
import React from 'react';

interface TableStateContextType {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
  filter: TableFilterModel | null;
  setFilter: React.Dispatch<React.SetStateAction<TableFilterModel | null>>;
}

export const TableStateContext = React.createContext<TableStateContextType>(
  null as any,
);

export function useTableStateSetup() {
  const [limit, setLimit] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const [sort, setSort] = React.useState<TableSortModel | null>(null);
  const [filter, setFilter] = React.useState<TableFilterModel | null>(null);
  return { limit, setLimit, page, setPage, sort, setSort, filter, setFilter };
}
