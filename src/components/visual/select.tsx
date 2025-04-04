import {
  Badge,
  CheckIcon,
  Group,
  Stack,
  Text,
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
} from '@mantine/core';
import React from 'react';

interface SelectedComboboxWrapperProps {
  checked: boolean;
  children?: React.ReactNode;
}

export function SelectedComboboxWrapper(props: SelectedComboboxWrapperProps) {
  return (
    <Group flex="1" gap="xs" align="start">
      {props.checked && <CheckIcon />}
      {props.children}
    </Group>
  );
}

type DescriptionRenderOptionDictionary = Record<
  string,
  {
    label: string;
    description?: string | null;
    tags?: string[] | null;
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
        <SelectedComboboxWrapper checked={!!combobox.checked}>
          <Stack>
            <Text size="sm">{props.label}</Text>
            {props.tags && (
              <Group>
                {props.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </Group>
            )}
            {props.description && (
              <Text size="xs" c="gray">
                {props.description}
              </Text>
            )}
          </Stack>
        </SelectedComboboxWrapper>
      );
    },
    [dictionary],
  );
}
