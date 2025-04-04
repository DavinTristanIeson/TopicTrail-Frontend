import { Group, Button, Select, Fieldset } from '@mantine/core';
import { Download, PencilSimple } from '@phosphor-icons/react';

import React from 'react';
import { UserDataManagerRendererProps } from './types';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { fromPairs } from 'lodash';

interface LoadUserDataActionComponentProps<T>
  extends UserDataManagerRendererProps<T> {
  onEdit(id: string): void;
  label: string;
}

export function LoadUserDataActionComponent<T>(
  props: LoadUserDataActionComponentProps<T>,
) {
  const { data, label, onLoad, onEdit } = props;
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

  const renderOption = useDescriptionBasedRenderOption(dictionary);

  return (
    <Fieldset legend={`Load ${label}`}>
      <Select
        value={selectedId}
        data={data.map((item) => {
          return {
            label: item.name,
            value: item.id,
          };
        })}
        onChange={setSelectedId}
        renderOption={renderOption}
        className="flex-1"
        description={`Pick an item to perform an action on. You can either apply/use the selected item by pressing the "Apply" button or delete the filter by pressing the "Delete" button.`}
        inputContainer={(children) => {
          return (
            <Group align="start">
              {children}
              <Button
                leftSection={<Download />}
                disabled={!selectedId}
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
                disabled={!selectedId}
                onClick={() => {
                  if (!selectedId) return;
                  onEdit(selectedId);
                }}
              >
                Edit
              </Button>
            </Group>
          );
        }}
      />
    </Fieldset>
  );
}
