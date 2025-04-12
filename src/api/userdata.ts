import { components } from './openapi';

export type ComparisonStateModel =
  components['schemas']['ComparisonState-Output'];
export type DashboardModel = components['schemas']['Dashboard-Output'];
export type DashboardItemRect = components['schemas']['DashboardItemRect'];

export interface DashboardItemModel<T = unknown> {
  id: string;
  title: string;
  description: string | null;
  type: string;
  column: string;
  rect: DashboardItemRect;
  config: T;
}

export interface UserDataMetadata {
  name: string;
  tags: string[] | null;
  description: string | null;
}

export interface UserDataModel<T> extends UserDataMetadata {
  id: string;
  data: T;
}
