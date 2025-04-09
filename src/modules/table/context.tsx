import { TableSortModel } from '@/api/table';
import React from 'react';

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
