import {
  Group,
  Button,
  Select,
  type ComboboxItem,
  type SelectProps,
} from '@mantine/core';
import { Download, PencilSimple } from '@phosphor-icons/react';

import React from 'react';
import { UserDataManagerRendererProps } from './types';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { fromPairs } from 'lodash-es';
import { filterByString, pickArrayByIndex } from '@/common/utils/iterable';
import { UserDataModel } from '@/api/userdata';
import { useUncontrolled } from '@mantine/hooks';

interface LoadUserDataActionComponentProps<T>
  extends UserDataManagerRendererProps<T> {
  onEdit(id: string): void;
}

interface UserDataComboboxItem<T> extends ComboboxItem {
  data: UserDataModel<T>;
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
            data: item,
          } as UserDataComboboxItem<T>;
        })}
        disabled={data.length === 0}
        onChange={setSelectedId}
        renderOption={renderOption}
        filter={(input) => {
          const data = input.options.map(
            (option) => (option as UserDataComboboxItem<T>).data,
          );
          const indices = filterByString(
            input.search,
            data.map((item) => {
              return {
                tags: item.tags ?? [],
                name: item.name,
              };
            }),
          );
          return pickArrayByIndex(input.options, indices);
        }}
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

interface LoadUserDataSelectInputProps<T> {
  data: UserDataModel<T>[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?(data: UserDataModel<T> | null): void;
  selectProps?: SelectProps;
}

export function LoadUserDataSelectInput<T>(
  props: LoadUserDataSelectInputProps<T>,
) {
  const {
    data,
    value: controlledValue,
    defaultValue,
    onChange: onChangeControlled,
    selectProps,
  } = props;
  const [value, onChange] = useUncontrolled({
    value: controlledValue,
    defaultValue: defaultValue,
  });

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
    <Select
      {...selectProps}
      value={value}
      data={data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          data: item,
        } as UserDataComboboxItem<T>;
      })}
      disabled={data.length === 0}
      onChange={(value, option) => {
        onChange(value);
        onChangeControlled?.((option as UserDataComboboxItem<T>)?.data ?? null);
      }}
      renderOption={renderOption}
      filter={(input) => {
        const data = input.options.map(
          (option) => (option as UserDataComboboxItem<T>).data,
        );
        const indices = filterByString(
          input.search,
          data.map((item) => {
            return {
              tags: item.tags ?? [],
              name: item.name,
            };
          }),
        );
        return pickArrayByIndex(input.options, indices);
      }}
    />
  );
}
