import { TableFilterModel } from '@/api/table';
import { ListSkeleton } from '@/components/visual/loading';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import React from 'react';
import ComparisonFilterDrawer from './drawer';
import { Button, Stack, Title } from '@mantine/core';
import { NamedFiltersContext } from '../context';
import { Plus } from '@phosphor-icons/react';
import { defaultTableFilterFormValues } from '@/modules/filter/drawer/form-type';
import { NamedTableFilterModel } from '@/api/comparison';

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
        <Title order={2} className="pb-3">
          Groups
        </Title>
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
