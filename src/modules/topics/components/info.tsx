import { getTopicLabel, TopicModel } from '@/api/topic';
import Colors from '@/common/constants/colors';
import {
  getTextColorBasedOnContrast,
  getPlotColor,
} from '@/common/utils/colors';
import { Stack, Group, Badge, Text } from '@mantine/core';
import chroma from 'chroma-js';

interface TopicWordsRendererProps {
  words: TopicModel['words'];
  limit?: number | null;
}

export function TopicWordsRenderer(props: TopicWordsRendererProps) {
  const { words, limit = 10 } = props;
  const usedTopicWords = limit != null ? words.slice(0, limit) : words;
  const maxWordValue = usedTopicWords.reduce(
    (acc, cur) => Math.max(acc, cur[1]),
    0,
  );
  const normalizedWordValues = usedTopicWords.map(
    ([, value]) => value / maxWordValue,
  );

  return (
    <Group gap="xs">
      {usedTopicWords.map(([word, value], index) => {
        const proportion = normalizedWordValues[index]!;
        const backgroundColor = chroma(Colors.brand).alpha(proportion).hex();
        return (
          <Text
            key={word}
            fw={500}
            px={4}
            py={2}
            size="xs"
            className="rounded"
            style={{
              backgroundColor,
              color: getTextColorBasedOnContrast(backgroundColor),
            }}
          >
            {`${word} (${value.toFixed(2)})`}
          </Text>
        );
      })}
    </Group>
  );
}

interface TopicInfoProps extends TopicModel {
  topicWordsLimit?: number | null;
}

export function TopicInfo(props: TopicInfoProps) {
  return (
    <Stack className="w-full pb-2">
      <Group gap={6}>
        <Text size="sm" fw={500} c={getPlotColor(props.id)}>
          {getTopicLabel(props)}
        </Text>
        {props.frequency && (
          <Text size="xs" c="gray">{`(${props.frequency} rows)`}</Text>
        )}
      </Group>
      {props.words && props.words.length > 0 && (
        <div>
          <Text size="xs" c="gray">
            Topic Words
          </Text>
          <TopicWordsRenderer {...props} limit={props.topicWordsLimit} />
        </div>
      )}
      {props.tags && props.tags.length > 0 && (
        <div>
          <Text size="xs" c="gray">
            Tags
          </Text>
          <Group>
            {props.tags.map((tag) => (
              <Badge key={tag} variant="light" radius="sm">
                {tag}
              </Badge>
            ))}
          </Group>
        </div>
      )}
      {props.description && (
        <div>
          <Text size="xs" c="gray">
            Description
          </Text>
          <Text size="sm">{props.description}</Text>
        </div>
      )}
    </Stack>
  );
}
