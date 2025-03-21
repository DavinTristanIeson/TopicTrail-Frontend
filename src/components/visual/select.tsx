import {
  Text,
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
} from '@mantine/core';
import React from 'react';

type DescriptionRenderOptionDictionary = Record<
  string,
  {
    label: string;
    description: string;
  }
>;

export function useDescriptionBasedRenderOption(
  dictionary: DescriptionRenderOptionDictionary,
) {
  return React.useCallback(
    (
      combobox: ComboboxLikeRenderOptionInput<ComboboxItem>,
    ): React.ReactNode => {
      const { option } = combobox;
      const props = dictionary[option.value];
      if (!props) {
        return option.label;
      }
      return (
        <div>
          <Text size="sm">{props.label}</Text>
          <Text size="xs" c="gray">
            {props.description}
          </Text>
        </div>
      );
    },
    [dictionary],
  );
}
