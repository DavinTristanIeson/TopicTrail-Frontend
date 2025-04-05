import { components } from './openapi';

export type ComparisonStateModel =
  components['schemas']['ComparisonState-Output'];
export type DashboardModel = components['schemas']['Dashboard-Output'];

export interface UserDataMetadata {
  name: string;
  tags: string[] | null;
  description: string | null;
}

export interface UserDataModel<T> extends UserDataMetadata {
  id: string;
  data: T;
}
