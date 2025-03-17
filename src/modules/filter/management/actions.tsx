import { TableFilterModel } from '@/api/table';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { Group, TextInput, Button, Select } from '@mantine/core';
import { Download, FloppyDisk, TrashSimple } from '@phosphor-icons/react';

import React from 'react';
import { useCheckFilterValidity, useLocallySavedFilters } from './hooks';
import { showNotification } from '@mantine/notifications';

interface FilterManagementActionComponentProps {
  onClose(): void;
  filter: TableFilterModel;
  setFilter(filter: TableFilterModel): void;
}

export function SaveFilterActionComponent(
  props: FilterManagementActionComponentProps,
) {
  const { onClose, filter } = props;
  const [filterName, setFilterName] = React.useState('');
  const [savedFilters, setSavedFilters] = useLocallySavedFilters();

  let error: string | undefined = undefined;
  if (filterName.length === 0) {
    error = 'Filter name is required.';
  } else if (Object.prototype.hasOwnProperty.call(savedFilters, filterName)) {
    error = 'There already exists a filter with that name.';
  }

  return (
    <Group>
      <TextInput
        value={filterName}
        onChange={(e) => setFilterName(e.target.value)}
        label="Filter Name"
        error={filterName.length === 0 ? '.' : undefined}
      />
      <Button
        onClick={async () => {
          setSavedFilters((prev) => {
            return {
              ...prev,
              [filterName]: filter,
            };
          });
          onClose();
        }}
        disabled={!!error}
        leftSection={<FloppyDisk />}
      >
        Save
      </Button>
    </Group>
  );
}

export function LoadFilterActionComponent(
  props: FilterManagementActionComponentProps,
) {
  const { onClose, setFilter } = props;
  const [savedFilters, setSavedFilters] = useLocallySavedFilters();
  const [selectedFilterName, setSelectedFilter] = React.useState<string | null>(
    null,
  );
  const selectedFilter = selectedFilterName
    ? savedFilters[selectedFilterName]
    : undefined;
  const confirmDeleteFilter = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      {selectedFilterName && (
        <ConfirmationDialog
          ref={confirmDeleteFilter}
          dangerous
          message={`Are you sure you want to delete ${selectedFilterName ? `the filter named "${selectedFilterName}"` : 'this filter'}? Deleted filters cannot be recovered.`}
          title="Delete Filter"
          onConfirm={async () => {
            setSavedFilters((prev) => {
              const next = { ...prev };
              delete next[selectedFilterName];
              return next;
            });
          }}
        />
      )}
      <Group gap="sm">
        <Select
          value={selectedFilterName}
          data={Object.keys(savedFilters)}
          onChange={setSelectedFilter}
          label="Load a filter"
          className="flex-1"
        />
        <Button
          leftSection={<Download />}
          disabled={!selectedFilter}
          onClick={() => {
            if (!selectedFilter) return;
            setFilter(selectedFilter);
            onClose();
          }}
        >
          Save
        </Button>
        <Button
          color="red"
          variant="outline"
          leftSection={<TrashSimple />}
          onClick={() => {
            confirmDeleteFilter.current?.open();
          }}
          disabled={!selectedFilter}
        >
          Delete
        </Button>
      </Group>
    </>
  );
}
