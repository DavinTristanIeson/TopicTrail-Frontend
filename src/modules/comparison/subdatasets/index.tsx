import { TableFilterModel } from '@/api/table';
import { ListSkeleton } from '@/components/visual/loading';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import React from 'react';
import ComparisonFilterDrawer from './drawer';
import {
  Button,
  Checkbox,
  Group,
  Popover,
  Stack,
  Tooltip,
} from '@mantine/core';
import {
  CaretDown,
  Eye,
  EyeSlash,
  Plus,
  Subtract,
  Unite,
  Warning,
} from '@phosphor-icons/react';
import { defaultTableFilterFormValues } from '@/modules/filter/drawer/form-type';
import { ComparisonStateItemModel } from '@/api/comparison';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import UserDataManager from '@/modules/userdata';
import {
  useCheckComparisonSubdatasetsVisibility,
  useComparisonAppState,
} from '../app-state';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { EnumerationSubdatasets } from './enumeration';
import { useNegateComparisonSubdataset } from './utils';
import MergeSubdatasetModal from './merge-subdataset';
import { showNotification } from '@mantine/notifications';

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

  return <UserDataManager {...rendererProps} label="Subdatasets" />;
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

function ComparisonStateManagerMoreActionsButton() {
  const negate = useNegateComparisonSubdataset();
  const subdatasets = useComparisonAppState((store) => store.groups.state);
  const onNegateAll = React.useCallback(() => {
    for (const subdataset of subdatasets) {
      negate(subdataset);
    }
    showNotification({
      message:
        'Successfully created negated versions of all of the existing subdatasets.',
      color: 'green',
    });
  }, [negate, subdatasets]);
  const mergeRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <>
      <Popover zIndex={20}>
        <Popover.Target>
          <Button variant="outline" rightSection={<CaretDown />}>
            More Actions
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack>
            <Tooltip label="Negate all of the existing subdatasets. This may be helpful if you want to do pairwise comparisons between values that are part of a subdataset and values that are not, for all subdatasets.">
              <Button
                variant="subtle"
                onClick={onNegateAll}
                leftSection={<Subtract />}
              >
                Negate All Subdataset
              </Button>
            </Tooltip>
            <Tooltip label="Merge two or more subdatasets into a new subdataset or into an existing subdataset.">
              <Button
                variant="subtle"
                onClick={() => {
                  mergeRemote.current?.open();
                }}
                leftSection={<Unite />}
              >
                Merge Subdatasets
              </Button>
            </Tooltip>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      <MergeSubdatasetModal ref={mergeRemote} />
    </>
  );
}

function ComparisonStateManagerWholeDatasetCheckbox() {
  const includeWholeDataset = useComparisonAppState(
    (store) => store.groups.includeWholeDataset,
  );
  const setIncludeWholeDataset = useComparisonAppState(
    (store) => store.groups.setIncludeWholeDataset,
  );
  const includeAntiSubdataset = useComparisonAppState(
    (store) => store.groups.includeAntiSubdataset,
  );
  const setIncludeAntiSubdataset = useComparisonAppState(
    (store) => store.groups.setIncludeAntiSubdataset,
  );
  return (
    <>
      <Checkbox
        label="Include whole dataset?"
        description="You can include the whole dataset in your comparison. This may be helpful when comparing the data of the subdatasets to the original dataset to see if there's any noticeable deviation."
        checked={includeWholeDataset}
        onChange={(e) => setIncludeWholeDataset(e.target.checked)}
      />
      <Checkbox
        label="Include unused rows?"
        description="You can include the rows that are not included in any subdatasets. This may be helpful when comparing the data that match certain conditions (e.g.: documents with a topic) to data that don't match the conditions (e.g.: outlier documents) to see if there's any noticeable deviation."
        checked={includeAntiSubdataset}
        onChange={(e) => setIncludeAntiSubdataset(e.target.checked)}
      />
    </>
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
        <EnumerationSubdatasets />
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
          <ComparisonStateManagerMoreActionsButton />
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
