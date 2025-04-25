import { NamedTableFilterModel } from '@/api/comparison';
import { SchemaColumnModel } from '@/api/project';
import React from 'react';
import { createContext } from 'use-context-selector';
import { DashboardItemTypeEnum } from './dashboard-item-types';
import { DashboardItemModel } from '@/api/userdata';

export const DashboardGroupsContext = React.createContext<
  NamedTableFilterModel[]
>([]);

interface DashboardConstraintContextType {
  columns?: SchemaColumnModel[];
  defaultColumn?: string;
  allowedTypes?: DashboardItemTypeEnum[];

  /** If allowed types is defined, without types is ignored */
  withoutTypes?: DashboardItemTypeEnum[];

  /** Which dashboard item types should use the whole dataset, and should ignore DashboardGroupsContext */
  shouldUseWholeDataset?(
    item: DashboardItemModel,
    column: SchemaColumnModel,
  ): boolean;
}

export const DashboardConstraintContext =
  createContext<DashboardConstraintContextType>({});
