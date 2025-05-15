import { TableFilterModel } from '@/api/table';
import { ListSkeleton } from '@/components/visual/loading';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import React from 'react';
import ComparisonFilterDrawer from './drawer';
import { Button, Checkbox, Fieldset, Group, Stack } from '@mantine/core';
import { Eye, EyeSlash, Plus, Warning } from '@phosphor-icons/react';
import { defaultTableFilterFormValues } from '@/modules/filter/drawer/form-type';
import { ComparisonStateItemModel } from '@/api/comparison';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import UserDataManager from '@/modules/userdata';
import {
  useCheckComparisonSubdatasetsVisibility,
  useComparisonAppState,
} from '../app-state';
import ConfirmationDialog from '@/components/widgets/confirmation';
import {
  EnumerationSubdatasetsBooleanColumns,
  EnumerationSubdatasetSelectInput,
} from './enumeration';

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
  const setVisibility = useComparisonAppState(
    (store) => store.groups.setVisibility,
  );

  const rendererProps = useComparisonStateDataManager({
    onApply(state) {
      setComparisonGroups(state.groups);
      setVisibility(new Map(state.groups.map((group) => [group.name, true])));
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

  return (
    <UserDataManager
      {...rendererProps}
      label="Subdatasets"
      Bottom={
        <Fieldset legend="Enumeration" className="w-full">
          <Stack>
            <EnumerationSubdatasetSelectInput />
            <EnumerationSubdatasetsBooleanColumns />
          </Stack>
        </Fieldset>
      }
    />
  );
}

function ComparisonStateManagerShowHideAllButton() {
  const groups = useComparisonAppState((store) => store.groups.state);
  const setVisibility = useComparisonAppState(
    (store) => store.groups.setVisibility,
  );
  const { isAllVisible } = useCheckComparisonSubdatasetsVisibility();

  const isAll = isAllVisible(groups);

  return (
    <Button
      variant="outline"
      color={isAll ? 'red' : 'green'}
      leftSection={isAll ? <EyeSlash /> : <Eye />}
      disabled={groups.length === 0}
      onClick={() => {
        setVisibility(new Map(groups.map((group) => [group.name, !isAll])));
      }}
    >
      {isAll ? 'Hide' : 'Show'} All
    </Button>
  );
}

function ComparisonStateManagerWholeDatasetCheckbox() {
  const includeWholeDataset = useComparisonAppState(
    (store) => store.groups.includeWholeDataset,
  );
  const setIncludeWholeDataset = useComparisonAppState(
    (store) => store.groups.setIncludeWholeDataset,
  );
  return (
    <Checkbox
      label="Include whole dataset?"
      description="You can include the whole dataset in your comparison. This may be helpful when comparing the frequency distributions of the subdatasets to the original dataset to see if there's any noticeable deviation."
      checked={includeWholeDataset}
      onChange={(e) => setIncludeWholeDataset(e.target.checked)}
    />
  );
}

export default function NamedFiltersManager() {
  const editRemote =
    React.useRef<ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null>(
      null,
    );
  const confirmationRemote = React.useRef<DisclosureTrigger | null>(null);
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const setVisibility = useComparisonAppState(
    (store) => store.groups.setVisibility,
  );
  return (
    <>
      <Stack>
        <ComparisonStateDataManager />
        {comparisonGroups.length > 0 && (
          <ComparisonStateManagerWholeDatasetCheckbox />
        )}
        <SortableNamedTableFilterDndContext editRemote={editRemote} />
        <Group>
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
          <ComparisonStateManagerShowHideAllButton />
          <div className="flex-1" />
          <ConfirmationDialog
            dangerous
            title="Reset Subdatasets?"
            message='Are you sure you want to reset the subdatasets? If you want to reuse these subdatasets, you should save it first through the "Manage Subdatasets" menu at the top.'
            onConfirm={() => {
              setComparisonGroups([]);
              setVisibility(new Map());
            }}
            ref={confirmationRemote}
          />
          <Button
            color="red"
            leftSection={<Warning />}
            onClick={() => {
              confirmationRemote.current?.open();
            }}
            disabled={comparisonGroups.length === 0}
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
