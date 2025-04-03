import { NamedTableFilterModel } from '@/api/comparison';
import { SchemaColumnModel } from '@/api/project';
import React from 'react';

export interface NamedData<TData> {
  data: TData;
  name: string;
}

export interface BaseVisualizationConfig {
  column: SchemaColumnModel;
  groups: NamedTableFilterModel[];
}

export interface BaseVisualizationComponentProps<TData, TConfig> {
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

export interface BaseVisualizationConfigManagerProps<TConfig> {
  config: TConfig;
  onSubmit(config: TConfig): void;
}

export interface VisualizationConfigEntry<TData, TConfig> {
  type: string;
  label: string;
  description: string;
  configManager: React.FC<BaseVisualizationConfigManagerProps<TConfig>> | null;
  dataProvider: React.FC<BaseVisualizationDataProviderHook<TData, TConfig>>;
  component: React.FC<BaseVisualizationComponentProps<TData, TConfig>>;
}
