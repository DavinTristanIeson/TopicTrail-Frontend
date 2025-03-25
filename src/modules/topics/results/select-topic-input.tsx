import { TopicModel } from '@/api/topic';
import Colors from '@/common/constants/colors';
import {
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
  type SelectProps,
  Badge,
  Group,
  Select,
  Stack,
  Text,
} from '@mantine/core';

export interface TopicComboboxItem extends ComboboxItem {
  data: TopicModel;
}

function TopicWordsRenderer(props: TopicModel) {
  const maxWordValue = props.words.reduce(
    (acc, cur) => Math.max(acc, cur[1]),
    0,
  );
  const normalizedWordValues = props.words.map(
    ([, value]) => value / maxWordValue,
  );
  const hexValueBase = normalizedWordValues.map((value) =>
    Math.min(255, value * 127 + 128),
  );
  return (
    <Group>
      {props.words.slice(0, 5).map(([word], index) => {
        const hexValue = hexValueBase[index]!.toString(16);
        return (
          <Badge
            key={word}
            color={`${Colors.brand}${hexValue}`}
            variant="light"
            radius="sm"
          >
            {word}
          </Badge>
        );
      })}
    </Group>
  );
}

function TopicComboboxItemRenderer(
  combobox: ComboboxLikeRenderOptionInput<TopicComboboxItem>,
) {
  const { option } = combobox;

  return (
    <Stack>
      <Group gap={6}>
        <Text size="sm" c="brand" fw={500}>
          {option.data.id + 1}.
        </Text>
        <Text size="sm" fw={500} c="brand">
          {option.label}
        </Text>
        <Text size="xs" c="gray">{`(${option.data.frequency} rows)`}</Text>
      </Group>
      <div>
        <Text size="xs" c="gray">
          Topic Words
        </Text>
        <TopicWordsRenderer {...option.data} />
      </div>
      <div>
        {option.data.tags && (
          <>
            <Text size="xs">Tags</Text>
            <Group>
              {option.data.tags.map((tag) => (
                <Badge key={tag} variant="light" radius="sm">
                  {tag}
                </Badge>
              ))}
            </Group>
          </>
        )}
      </div>
      {option.data.description && (
        <Text size="xs">{option.data.description}</Text>
      )}
    </Stack>
  );
}

interface TopicSelectInputProps
  extends Omit<SelectProps, 'onChange' | 'data' | 'value'> {
  data: TopicModel[];
  value: number | null;
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
