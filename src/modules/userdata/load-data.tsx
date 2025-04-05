import { Group, Button, Select } from '@mantine/core';
import { Download, PencilSimple } from '@phosphor-icons/react';

import React from 'react';
import { UserDataManagerRendererProps } from './types';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { fromPairs } from 'lodash';

interface LoadUserDataActionComponentProps<T>
  extends UserDataManagerRendererProps<T> {
  onEdit(id: string): void;
}

export function LoadUserDataActionComponent<T>(
  props: LoadUserDataActionComponentProps<T>,
) {
  const { data, onLoad, onEdit } = props;
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const dictionary = React.useMemo(() => {
    return fromPairs(
      data.map((item) => {
        return [
          item.id,
          {
            label: item.name,
            description: item.description,
            tags: item.tags,
          },
        ];
      }),
    );
  }, [data]);

  const selectedData = selectedId ? dictionary[selectedId] : undefined;

  const renderOption = useDescriptionBasedRenderOption(dictionary);

  return (
    <Group align="start" className="flex-1">
      <Select
        value={selectedId}
        data={data.map((item) => {
          return {
            label: item.name,
            value: item.id,
          };
        })}
        disabled={data.length === 0}
        onChange={setSelectedId}
        renderOption={renderOption}
        styles={{
          input: {
            minWidth: 448,
          },
        }}
        description={`Pick an item to perform an action on. You can either apply/use the selected item by pressing the "Apply" button or delete the filter by pressing the "Delete" button.`}
      />
      <Button
        leftSection={<Download />}
        disabled={!selectedData}
        onClick={() => {
          if (!selectedId) return;
          onLoad(selectedId);
        }}
      >
        Apply
      </Button>
      <Button
        variant="outline"
        leftSection={<PencilSimple />}
        disabled={!selectedData}
        onClick={() => {
          if (!selectedId) return;
          onEdit(selectedId);
        }}
      >
        Edit
      </Button>
    </Group>
  );
}
