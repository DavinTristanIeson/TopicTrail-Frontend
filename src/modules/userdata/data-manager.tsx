import { TableFilterModel } from '@/api/table';
import { useBaseUserDataManager } from './base-data-manager';
import {
  UserDataManagerHookProps,
  UserDataManagerRendererProps,
} from './types';
import { ComparisonStateModel, DashboardModel } from '@/api/userdata';

export function useFilterDataManager(
  props: UserDataManagerHookProps<TableFilterModel>,
): UserDataManagerRendererProps<TableFilterModel> {
  return useBaseUserDataManager({
    ...props,
    label: 'filter',
    pathname: 'filters',
  });
}

export function useComparisonStateDataManager(
  props: UserDataManagerHookProps<ComparisonStateModel>,
): UserDataManagerRendererProps<ComparisonStateModel> {
  return useBaseUserDataManager({
    ...props,
    label: 'comparison groups',
    pathname: 'comparison-state',
  });
}

export function useDashboardDataManager(
  props: UserDataManagerHookProps<DashboardModel>,
): UserDataManagerRendererProps<DashboardModel> {
  return useBaseUserDataManager({
    ...props,
    label: 'dashboard',
    pathname: 'dashboard',
  });
}
