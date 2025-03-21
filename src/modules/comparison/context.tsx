import { NamedTableFilterModel } from '@/api/table';
import React from 'react';

interface NamedFiltersContextType {
  filters: NamedTableFilterModel[];
  setFilters: React.Dispatch<React.SetStateAction<NamedTableFilterModel[]>>;
}

export const NamedFiltersContext = React.createContext<NamedFiltersContextType>(
  {
    filters: [],
    setFilters() {},
  },
);
