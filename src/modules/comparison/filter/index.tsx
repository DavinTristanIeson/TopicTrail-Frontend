import { TableFilterModel } from '@/api/table';
import { ListSkeleton } from '@/components/visual/loading';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import React from 'react';
import ComparisonFilterDrawer from './drawer';
import { Button, Group, Stack } from '@mantine/core';
import { Plus, Warning } from '@phosphor-icons/react';
import { defaultTableFilterFormValues } from '@/modules/filter/drawer/form-type';
import { NamedTableFilterModel } from '@/api/comparison';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import UserDataManager from '@/modules/userdata';
import { useComparisonAppState } from '../app-state';
import ConfirmationDialog from '@/components/widgets/confirmation';

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

  return <UserDataManager {...rendererProps} label="Subdatasets" />;
}

export default function NamedFiltersManager() {
  const editRemote =
    React.useRef<ParametrizedDisclosureTrigger<NamedTableFilterModel> | null>(
      null,
    );
  const confirmationRemote = React.useRef<DisclosureTrigger | null>(null);
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const { setState: setComparisonGroups } = useComparisonAppState(
    (store) => store.groups.handlers,
  );
  return (
    <>
      <Stack>
        <ComparisonStateDataManager />
        <SortableNamedTableFilterDndContext editRemote={editRemote} />
        <Group justify="space-between">
          <Button
            leftSection={<Plus />}
            className="max-w-md"
            onClick={() => {
              editRemote.current?.open({
                name: `Subdataset ${comparisonGroups.length + 1}`,
                filter: defaultTableFilterFormValues as TableFilterModel,
              });
            }}
          >
            Add New Subdataset
          </Button>
          <ConfirmationDialog
            dangerous
            title="Reset Subdatasets?"
            message='Are you sure you want to reset the subdatasets? If you want to reuse these subdatasets, you should save it first through the "Manage Subdatasets" menu at the top.'
            onConfirm={() => {
              setComparisonGroups([]);
            }}
            ref={confirmationRemote}
          />
          <Button
            color="red"
            leftSection={<Warning />}
            onClick={() => {
              confirmationRemote.current?.open();
            }}
            variant="outline"
          >
            Reset
          </Button>
        </Group>
      </Stack>
      <ComparisonFilterDrawer ref={editRemote} />
    </>
  );
}
