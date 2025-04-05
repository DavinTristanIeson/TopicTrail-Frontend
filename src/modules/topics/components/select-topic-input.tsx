import { getTopicLabel, TopicModel } from '@/api/topic';
import {
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
  type SelectProps,
  type MultiSelectProps,
  type OptionsFilter,
  HoverCard,
  MultiSelect,
  Select,
  Stack,
  Text,
  Divider,
  Group,
} from '@mantine/core';
import { TopicInfo, TopicWordsRenderer } from './info';
import { Info } from '@phosphor-icons/react';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import React from 'react';
import { filterByString, pickArrayByIndex } from '@/common/utils/iterable';
import { SelectedComboboxWrapper } from '@/components/visual/select';

export interface TopicComboboxItem extends ComboboxItem {
  data: TopicModel;
}

export const OUTLIER_TOPIC: TopicModel = {
  frequency: 0,
  id: -1,
  label: 'Outlier',
  words: [],
  description:
    'This is not an actual topic, but rather a group for all documents that are not assigned to a topic.',
};

function TopicComboboxItemRenderer(
  combobox: ComboboxLikeRenderOptionInput<TopicComboboxItem>,
) {
  const { option, checked } = combobox;
  if (!option.data) {
    if (option.value === '-1') {
      return (
        <SelectedComboboxWrapper checked={checked}>
          <Text size="sm" c="gray" fw={500}>
            {OUTLIER_TOPIC.label}
          </Text>
          <Text size="xs" c="gray">
            {OUTLIER_TOPIC.description}
          </Text>
        </SelectedComboboxWrapper>
      );
    }
    return (
      <SelectedComboboxWrapper checked={checked}>
        {option.label}
      </SelectedComboboxWrapper>
    );
  }

  return (
    <SelectedComboboxWrapper checked={checked}>
      <TopicInfo {...option.data} />
    </SelectedComboboxWrapper>
  );
}

const topicFilterFunction: OptionsFilter = (input) => {
  if (!input.search) return input.options;
  const indices = filterByString(
    input.search,
    input.options.map((opt) => {
      const option = opt as TopicComboboxItem;
      return {
        label: option.label,
        words: option.data.words.map((word) => word[0]),
        tags: option.data.tags,
      };
    }),
  );
  return pickArrayByIndex(input.options, indices);
};

function topicsToComboboxes(
  topics: TopicModel[],
  withOutlier: boolean = false,
): ComboboxItem[] {
  const topicComboboxes = topics.map((topic) => {
    return {
      label: getTopicLabel(topic),
      value: topic.id.toString(),
      data: topic,
    } as TopicComboboxItem;
  });
  if (!withOutlier) {
    return topicComboboxes;
  }
  return [
    ...topicComboboxes,
    {
      label: OUTLIER_TOPIC.label,
      value: OUTLIER_TOPIC.id.toString(),
      data: null,
    } as ComboboxItem,
  ];
}

export interface TopicSelectInputProps
  extends Omit<SelectProps, 'onChange' | 'data' | 'value'> {
  data: TopicModel[];
  value?: number | null;
  onChange?(column: TopicModel | null): void;
  withOutlier: boolean;
}

export function TopicSelectInput(props: TopicSelectInputProps) {
  const { onChange, data, value, withOutlier, ...selectProps } = props;
  const currentTopic =
    value != null ? data.find((x) => x.id === value) : undefined;
  return (
    <Select
      placeholder="Pick a topic"
      description={currentTopic && <TopicWordsRenderer {...currentTopic} />}
      {...selectProps}
      value={value != null ? value.toString() : null}
      renderOption={TopicComboboxItemRenderer as SelectProps['renderOption']}
      searchable
      filter={topicFilterFunction}
      data={topicsToComboboxes(data, withOutlier)}
      onChange={(value) => {
        if (value == null) {
          onChange?.(null);
          return;
        }
        const topicId = parseInt(value);
        if (withOutlier && topicId === OUTLIER_TOPIC.id) {
          onChange?.(OUTLIER_TOPIC);
        }
        const chosenTopic = data.find((x) => x.id === topicId) ?? null;
        onChange?.(chosenTopic);
      }}
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

export interface TopicMultiSelectInputProps
  extends Omit<MultiSelectProps, 'onChange' | 'data' | 'value'> {
  data: TopicModel[];
  value?: number[];
  onChange?(column: TopicModel[]): void;
  withOutlier: boolean;
}

export function TopicMultiSelectInput(props: TopicMultiSelectInputProps) {
  const { onChange, data, value, withOutlier, ...selectProps } = props;

  const currentTopics = value
    ? value.map((val) => data.find((x) => x.id === val)!).filter(Boolean)
    : [];

  return (
    <MultiSelect
      placeholder="Pick a topic"
      description={
        currentTopics.length > 0 && (
          <HoverCard position="bottom">
            <HoverCard.Target>
              <Group className="w-fit">
                <Info /> View Selected Topics
              </Group>
            </HoverCard.Target>
            <HoverCard.Dropdown className="max-w-lg">
              <Stack>
                {currentTopics.map((topic) => (
                  <React.Fragment key={topic.id}>
                    <TopicInfo {...topic} />
                    <Divider />
                  </React.Fragment>
                ))}
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
        )
      }
      {...selectProps}
      value={value?.map(String) ?? []}
      searchable
      data={topicsToComboboxes(data, withOutlier)}
      filter={topicFilterFunction}
      renderOption={TopicComboboxItemRenderer as SelectProps['renderOption']}
      onChange={(value) => {
        const topics = value
          .map((val) => parseInt(val))
          .map((topicId) => {
            if (withOutlier && topicId === OUTLIER_TOPIC.id) {
              return OUTLIER_TOPIC;
            }
            return data.find((x) => x.id === topicId)!;
          })
          .filter(Boolean);

        onChange?.(topics);
      }}
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
