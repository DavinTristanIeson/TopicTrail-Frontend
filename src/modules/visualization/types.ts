import { DashboardItemModel } from '@/api/userdata';
import { DashboardTypeEnum } from '@/common/constants/enum';
import React from 'react';

export interface NamedData<TData> {
  data: TData;
  name: string;
}

export interface BaseVisualizationComponentProps<
  TData,
  TConfig extends DashboardItemModel,
> {
  data: NamedData<TData>[];
  config: TConfig;
}

export type BaseVisualizationDataProviderHook<TData, TConfig> = (
  config: TConfig,
) => {
  data: NamedData<TData>[] | undefined;
  loading: boolean;
  error: string | undefined;
};

export interface VisualizationConfigEntry<
  TData,
  TConfig extends DashboardItemModel,
> {
  type: DashboardTypeEnum;
  label: string;
  description: string;
  dataProvider: React.FC<BaseVisualizationDataProviderHook<TData, TConfig>>;
  component: React.FC<BaseVisualizationComponentProps<TData, TConfig>>;
}
