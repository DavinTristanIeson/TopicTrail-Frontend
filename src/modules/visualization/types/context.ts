import { NamedTableFilterModel } from '@/api/comparison';
import { SchemaColumnModel } from '@/api/project';
import React from 'react';
import { createContext } from 'use-context-selector';
import { DashboardItemTypeEnum } from './dashboard-item-types';
import { DashboardItemModel } from '@/api/userdata';

export interface DashboardSubdatasetsContextType {
  default: NamedTableFilterModel[];
  byType?: Partial<Record<DashboardItemTypeEnum, NamedTableFilterModel[]>>;
  condition?(
    item: DashboardItemModel,
    column: SchemaColumnModel,
  ): NamedTableFilterModel[];
}

export const DashboardSubdatasetsContext =
  React.createContext<DashboardSubdatasetsContextType>(null as any);

export function useDashboardSubdatasets(
  item: DashboardItemModel,
  column: SchemaColumnModel,
) {
  const {
    default: defaultData,
    byType,
    condition,
  } = React.useContext(DashboardSubdatasetsContext);
  if (condition) {
    return condition(item, column);
  }
  const typeDiscriminatedData = byType?.[item.type as DashboardItemTypeEnum];
  if (typeDiscriminatedData) {
    return typeDiscriminatedData;
  }
  return defaultData;
}

export interface DashboardConstraintContextType {
  columns?: SchemaColumnModel[];
  defaultColumn?: string;
  allowedTypes?: DashboardItemTypeEnum[];

  /** If allowed types is defined, without types is ignored */
  withoutTypes?: DashboardItemTypeEnum[];
}

export const DashboardConstraintContext =
  createContext<DashboardConstraintContextType>({});
