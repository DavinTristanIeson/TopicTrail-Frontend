import { NamedTableFilterModel, TableFilterModel } from '@/api/table';
import { ListSkeleton } from '@/components/visual/loading';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import React from 'react';
import ComparisonFilterDrawer from './drawer';
import { Alert, Button, Stack } from '@mantine/core';
import { NamedFiltersContext } from '../context';
import { Plus, Warning } from '@phosphor-icons/react';
import { defaultTableFilterFormValues } from '@/modules/filter/drawer/form-type';

const SortableNamedTableFilterDndContext = dynamic(
  () => import('./sortable-filter-context'),
  {
    ssr: false,
    loading() {
      return <ListSkeleton count={3} />;
    },
  },
);

export default function NamedFiltersManager() {
  const editRemote =
    React.useRef<ParametrizedDisclosureTrigger<NamedTableFilterModel> | null>(
      null,
    );
  const { filters } = React.useContext(NamedFiltersContext);
  return (
    <>
      <Stack>
        <SortableNamedTableFilterDndContext editRemote={editRemote} />
        {filters.length < 2 && (
          <Alert color="yellow" icon={<Warning size={20} />}>
            First things first, create at least two groups to be compared. Each
            group represents a subset of your dataset, which is defined by a
            name and a filter. Press the &quot;Add New Filter&quot; button to
            create a new group.
          </Alert>
        )}
        <Button
          leftSection={<Plus />}
          onClick={() => {
            editRemote.current?.open({
              name: `Group ${filters.length + 1}`,
              filter: defaultTableFilterFormValues as TableFilterModel,
            });
          }}
        >
          Add New Filter
        </Button>
      </Stack>
      <ComparisonFilterDrawer ref={editRemote} />
    </>
  );
}
