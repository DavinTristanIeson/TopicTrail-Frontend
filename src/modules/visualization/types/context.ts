import { NamedTableFilterModel } from '@/api/comparison';
import React from 'react';

export const DashboardGroupsContext = React.createContext<
  NamedTableFilterModel[]
>([]);
