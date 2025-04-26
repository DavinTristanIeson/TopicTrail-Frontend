import { DashboardItemModel } from '@/api/userdata';
import React from 'react';
import * as Yup from 'yup';
import { DashboardItemTypeEnum } from './dashboard-item-types';

export interface NamedData<TData> {
  data: TData;
  name: string;
}

export interface BaseVisualizationComponentProps<TData, TConfig> {
  data: NamedData<TData>[];
  item: DashboardItemModel<TConfig>;
}

export type BaseVisualizationDataProviderHook<TData, TConfig> = (
  item: DashboardItemModel<TConfig>,
) => {
  data: NamedData<TData>[] | undefined;
  loading: boolean;
  error: string | undefined;
};

export interface VisualizationConfigEntry<TData, TConfig> {
  type: DashboardItemTypeEnum;
  label: string;
  description: string;
  dataProvider: BaseVisualizationDataProviderHook<TData, TConfig>;
  configForm: React.FC<object> | null;
  configValidator: Yup.AnyObjectSchema | null;
  component: React.FC<BaseVisualizationComponentProps<TData, TConfig>>;
}
