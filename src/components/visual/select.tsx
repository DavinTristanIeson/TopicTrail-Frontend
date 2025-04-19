import {
  Badge,
  Button,
  Group,
  Stack,
  Text,
  useMantineTheme,
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
} from '@mantine/core';
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react';
import React from 'react';

interface SelectedComboboxWrapperProps {
  checked: boolean | undefined;
  children?: React.ReactNode;
}

export function SelectedComboboxWrapper(props: SelectedComboboxWrapperProps) {
  const { colors } = useMantineTheme();
  return (
    <Group flex="1" gap="xs" align="start">
      {props.checked && (
        <Check color={colors.gray[6]} size={14} className="mt-0.5" />
      )}
      <div className="flex-1">{props.children}</div>
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
          <Stack gap={4}>
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

interface UseSelectLeftRightButtonsProps<T> {
  value: T | null;
  onChange(value: T | null): void;
  options: T[];
}

export function useSelectLeftRightButtons<T>(
  props: UseSelectLeftRightButtonsProps<T>,
) {
  const { value, options, onChange } = props;
  const index = React.useMemo(() => {
    if (value == null) return null;
    const index = options.findIndex((option) => option === value);
    if (index === -1) return null;
    return index;
  }, [options, value]);
  const canGoLeft = index == null || index > 0;
  const canGoRight = index == null || index < options.length - 1;
  const inputContainer = React.useCallback(
    (children: React.ReactNode) => {
      return (
        <Group>
          <Button
            leftSection={<ArrowLeft />}
            disabled={!canGoLeft}
            onClick={() => {
              const newIdx = index == null ? 0 : index - 1;
              const newValue = options[newIdx];
              if (newValue == null) return;
              onChange(newValue);
            }}
            variant="subtle"
          >
            Previous
          </Button>
          {children}
          <Button
            rightSection={<ArrowRight />}
            disabled={!canGoRight}
            onClick={() => {
              const newIdx = index == null ? 0 : index + 1;
              const newValue = options[newIdx];
              if (newValue == null) return;
              onChange(newValue);
            }}
            variant="subtle"
          >
            Next
          </Button>
        </Group>
      );
    },
    [canGoLeft, canGoRight, index, onChange, options],
  );
  return inputContainer;
}
