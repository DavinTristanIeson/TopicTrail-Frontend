import { TableFilterModel } from '@/api/table';
import { ListSkeleton } from '@/components/visual/loading';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import React from 'react';
import ComparisonFilterDrawer from './drawer';
import { Button, Stack } from '@mantine/core';
import { Plus } from '@phosphor-icons/react';
import { defaultTableFilterFormValues } from '@/modules/filter/drawer/form-type';
import { NamedTableFilterModel } from '@/api/comparison';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import UserDataManager from '@/modules/userdata';
import { useComparisonAppState } from '../app-state';

const SortableNamedTableFilterDndContext = dynamic(
  () => import('./sortable-filter-context'),
  {
    ssr: false,
    loading() {
      return <ListSkeleton count={3} />;
    },
  },
);

function ComparisonStateDataManager() {
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );

  const rendererProps = useComparisonStateDataManager({
    onApply(state) {
      setComparisonGroups(state.groups);
    },
    state: React.useMemo(() => {
      if (!comparisonGroups || comparisonGroups.length === 0) {
        return null;
      }
      return {
        groups: comparisonGroups,
      };
    }, [comparisonGroups]),
  });

  return <UserDataManager {...rendererProps} label="Comparison Groups" />;
}

export default function NamedFiltersManager() {
  const editRemote =
    React.useRef<ParametrizedDisclosureTrigger<NamedTableFilterModel> | null>(
      null,
    );
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  return (
    <>
      <Stack>
        <ComparisonStateDataManager />
        <SortableNamedTableFilterDndContext editRemote={editRemote} />
        <Button
          leftSection={<Plus />}
          className="max-w-md"
          onClick={() => {
            editRemote.current?.open({
              name: `Group ${comparisonGroups.length + 1}`,
              filter: defaultTableFilterFormValues as TableFilterModel,
            });
          }}
        >
          Add New Group
        </Button>
      </Stack>
      <ComparisonFilterDrawer ref={editRemote} />
    </>
  );
}
