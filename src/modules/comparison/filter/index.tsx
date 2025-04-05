import { TableFilterModel } from '@/api/table';
import { ListSkeleton } from '@/components/visual/loading';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import React from 'react';
import ComparisonFilterDrawer from './drawer';
import { Button, Stack } from '@mantine/core';
import { NamedFiltersContext } from '../context';
import { Plus } from '@phosphor-icons/react';
import { defaultTableFilterFormValues } from '@/modules/filter/drawer/form-type';
import { NamedTableFilterModel } from '@/api/comparison';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import UserDataManager from '@/modules/userdata';

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
  const { filters, setFilters } = React.useContext(NamedFiltersContext);
  const rendererProps = useComparisonStateDataManager({
    onApply(state) {
      setFilters(state.groups);
    },
    state: React.useMemo(() => {
      if (!filters || filters.length === 0) {
        return null;
      }
      return {
        groups: filters,
      };
    }, [filters]),
  });

  return <UserDataManager {...rendererProps} label="Comparison Groups" />;
}

export default function NamedFiltersManager() {
  const editRemote =
    React.useRef<ParametrizedDisclosureTrigger<NamedTableFilterModel> | null>(
      null,
    );
  const { filters } = React.useContext(NamedFiltersContext);
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
              name: `Group ${filters.length + 1}`,
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
