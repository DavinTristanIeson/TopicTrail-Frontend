import { TopicModel } from '@/api/topic';
import {
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
  type SelectProps,
  HoverCard,
  MultiSelect,
  type MultiSelectProps,
  Select,
  Stack,
} from '@mantine/core';
import { TopicInfo, TopicWordsRenderer } from '../components/info';
import { Info } from '@phosphor-icons/react';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';

export interface TopicComboboxItem extends ComboboxItem {
  data: TopicModel;
}

function TopicComboboxItemRenderer(
  combobox: ComboboxLikeRenderOptionInput<TopicComboboxItem>,
) {
  const { option } = combobox;

  return <TopicInfo {...option.data} />;
}

interface TopicSelectInputProps
  extends Omit<SelectProps, 'onChange' | 'data' | 'value'> {
  data: TopicModel[];
  value?: number | null;
  onChange?(column: TopicModel | null): void;
}

export function TopicSelectInput(props: TopicSelectInputProps) {
  const { onChange, data, value, ...selectProps } = props;
  const currentTopic = value ? data.find((x) => x.id === value) : undefined;
  return (
    <Select
      {...selectProps}
      value={value ? value.toString() : null}
      renderOption={TopicComboboxItemRenderer as SelectProps['renderOption']}
      data={data.map((item) => {
        return {
          label: item.label,
          value: item.id.toString(),
          data: item,
        } as TopicComboboxItem;
      })}
      onChange={(value) => {
        if (value == null) {
          onChange?.(null);
          return;
        }
        const topicId = parseInt(value);
        const chosenTopic = data.find((x) => x.id === topicId) ?? null;
        onChange?.(chosenTopic);
      }}
      placeholder="Pick a topic"
      description={currentTopic && <TopicWordsRenderer {...currentTopic} />}
    />
  );
}

export type TopicSelectFieldProps = TopicSelectInputProps &
  IRHFMantineAdaptable<TopicSelectInputProps>;

export function TopicSelectField(props: TopicSelectFieldProps) {
  const { mergedProps } = useRHFMantineAdapter<TopicSelectInputProps>(props, {
    extractEventValue(e) {
      return e?.id ?? null;
    },
  });
  return <TopicSelectInput {...mergedProps} />;
}

interface TopicMultiSelectInputProps
  extends Omit<MultiSelectProps, 'onChange' | 'data' | 'value'> {
  data: TopicModel[];
  value?: number[];
  onChange?(column: TopicModel[]): void;
}

export function TopicMultiSelectInput(props: TopicMultiSelectInputProps) {
  const { onChange, data, value, ...selectProps } = props;

  const currentTopics = value
    ? value.map((val) => data.find((x) => x.id === val)!).filter(Boolean)
    : [];

  return (
    <MultiSelect
      {...selectProps}
      value={value?.map(String) ?? []}
      renderOption={TopicComboboxItemRenderer as SelectProps['renderOption']}
      data={data.map((item) => {
        return {
          label: item.label,
          value: item.id.toString(),
          data: item,
        } as TopicComboboxItem;
      })}
      onChange={(value) => {
        const topics = value
          .map((val) => parseInt(val))
          .map((topicId) => data.find((x) => x.id === topicId)!)
          .filter(Boolean);

        onChange?.(topics);
      }}
      placeholder="Pick a topic"
      rightSection={
        <HoverCard>
          <HoverCard.Target>
            <Info />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Stack>
              {currentTopics.map((topic) => (
                <TopicWordsRenderer {...topic} key={topic.id} />
              ))}
            </Stack>
          </HoverCard.Dropdown>
        </HoverCard>
      }
    />
  );
}

export type TopicMultiSelectFieldProps = TopicMultiSelectInputProps &
  IRHFMantineAdaptable<TopicMultiSelectInputProps>;

export function TopicMultiSelectField(props: TopicMultiSelectFieldProps) {
  const { mergedProps } = useRHFMantineAdapter<TopicMultiSelectFieldProps>(
    props,
    {
      extractEventValue(topics) {
        return topics.map((topic) => topic.id) ?? [];
      },
    },
  );
  return <TopicMultiSelectInput {...mergedProps} />;
}
