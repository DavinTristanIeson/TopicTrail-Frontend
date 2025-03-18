import { TableFilterModel } from '@/api/table';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { Group, TextInput, Button, Select } from '@mantine/core';
import { Download, FloppyDisk, TrashSimple } from '@phosphor-icons/react';

import React from 'react';
import { useCheckFilterValidity, useLocallySavedFilters } from './hooks';
import PromiseButton from '@/components/standard/button/promise';
import { showNotification } from '@mantine/notifications';
import { handleErrorFn } from '@/common/utils/error';
import { isEmpty } from 'lodash';

export interface FilterManagementActionComponentProps {
  getFilter(): TableFilterModel;
  setFilter(filter: TableFilterModel): void;
}

export function SaveFilterActionComponent(
  props: FilterManagementActionComponentProps,
) {
  const { getFilter } = props;
  const [filterName, setFilterName] = React.useState('');
  const [savedFilters, setSavedFilters] = useLocallySavedFilters();

  const validateFilter = useCheckFilterValidity();

  let error: string | undefined = undefined;
  if (Object.prototype.hasOwnProperty.call(savedFilters, filterName)) {
    error = 'There already exists a filter with that name.';
  }

  return (
    <TextInput
      value={filterName}
      onChange={(e) => setFilterName(e.target.value)}
      label="Filter Name"
      error={error}
      description={`Specify the name of the current filter, and then click the "Save" button to save the filter. Saved filters can be loaded whenever you like.`}
      inputContainer={(children) => {
        return (
          <Group align="start">
            {children}
            <PromiseButton
              onClick={handleErrorFn(async () => {
                const filter = await validateFilter(getFilter());
                setSavedFilters((prev) => {
                  return {
                    ...prev,
                    [filterName]: filter,
                  };
                });
                showNotification({
                  message: `Filter "${filterName}" has been successfully saved! You can now load this filter from the "Load a filter" section whenever you like.`,
                  color: 'green',
                });
                setFilterName('');
              })}
              disabled={!!error || filterName.length === 0}
              leftSection={<FloppyDisk />}
            >
              Save
            </PromiseButton>
          </Group>
        );
      }}
    />
  );
}

export function LoadFilterActionComponent(
  props: FilterManagementActionComponentProps,
) {
  const { setFilter } = props;
  const [savedFilters, setSavedFilters] = useLocallySavedFilters();
  const [selectedFilterName, setSelectedFilterName] = React.useState<
    string | null
  >(null);
  const selectedFilter = selectedFilterName
    ? savedFilters[selectedFilterName]
    : undefined;
  const confirmDeleteFilter = React.useRef<DisclosureTrigger | null>(null);
  if (isEmpty(savedFilters)) {
    return null;
  }
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
            setSelectedFilterName(null);
          }}
        />
      )}
      <Select
        value={selectedFilterName}
        data={Object.keys(savedFilters)}
        onChange={setSelectedFilterName}
        label="Load a filter"
        className="flex-1"
        description={`Pick a filter to perform an action on. You can either apply the selected filter by pressing the "Apply" button or delete the filter by pressing the "Delete" button.`}
        inputContainer={(children) => {
          return (
            <Group align="start">
              {children}
              <Button
                leftSection={<Download />}
                disabled={!selectedFilter}
                onClick={() => {
                  if (!selectedFilter) return;
                  setFilter(selectedFilter);
                }}
              >
                Apply
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
          );
        }}
      />
    </>
  );
}
