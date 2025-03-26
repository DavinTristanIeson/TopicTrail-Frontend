import { TopicModel } from '@/api/topic';
import {
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
  type SelectProps,
  Select,
} from '@mantine/core';
import { TopicInfo, TopicWordsRenderer } from '../components/info';

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
