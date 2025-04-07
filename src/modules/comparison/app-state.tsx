import { NamedTableFilterModel } from '@/api/comparison';
import { DashboardItemModel } from '@/api/userdata';
import { useListState, type UseListStateHandlers } from '@mantine/hooks';
import { createContext, useContextSelector } from 'use-context-selector';

interface ComparisonAppStateContextType {
  dashboard: {
    state: DashboardItemModel[];
    handlers: UseListStateHandlers<DashboardItemModel>;
  };
  groups: {
    state: NamedTableFilterModel[];
    handlers: UseListStateHandlers<NamedTableFilterModel>;
  };
}

const ComparisonAppStateContext = createContext<ComparisonAppStateContextType>(
  null as any,
);

export default function ComparisonAppStateProvider(
  props: React.PropsWithChildren,
) {
  const [groups, groupHandlers] = useListState<NamedTableFilterModel>();
  const [dashboard, dashboardHandlers] = useListState<DashboardItemModel>([]);

  return (
    <ComparisonAppStateContext.Provider
      value={{
        groups: {
          state: groups,
          handlers: groupHandlers,
        },
        dashboard: {
          state: dashboard,
          handlers: dashboardHandlers,
        },
      }}
    >
      {props.children}
    </ComparisonAppStateContext.Provider>
  );
}

export function useComparisonAppState<T>(
  selector: (store: ComparisonAppStateContextType) => T,
) {
  return useContextSelector(ComparisonAppStateContext, selector);
}
