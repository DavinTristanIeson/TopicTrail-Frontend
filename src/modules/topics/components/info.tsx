import { getTopicLabel, TopicModel } from '@/api/topic';
import { Stack, Group, Badge, Text, useMantineTheme } from '@mantine/core';

interface TopicWordsRendererProps {
  words: TopicModel['words'];
}

export function TopicWordsRenderer(props: TopicWordsRendererProps) {
  const maxWordValue = props.words.reduce(
    (acc, cur) => Math.max(acc, cur[1]),
    0,
  );
  const normalizedWordValues = props.words.map(
    ([, value]) => value / maxWordValue,
  );
  const hexValueBase = normalizedWordValues.map((value) =>
    Math.round(Math.min(255, value * 127 + 128)),
  );

  const { colors } = useMantineTheme();
  return (
    <Group gap="xs">
      {props.words.slice(0, 5).map(([word, value], index) => {
        const proportion = normalizedWordValues[index]!;
        const hexValue = hexValueBase[index]!.toString(16);
        return (
          <Text
            key={word}
            fw={500}
            px={4}
            py={2}
            size="xs"
            className="rounded"
            style={{
              backgroundColor: `${colors.brand[6]}${hexValue}`,
              color: proportion > 0.5 ? 'white' : 'black',
            }}
          >
            {`${word} (${value.toFixed(2)})`}
          </Text>
        );
      })}
    </Group>
  );
}

export function TopicInfo(props: TopicModel) {
  return (
    <Stack className="border-solid border-b border-gray-400 w-full pb-2">
      <Group gap={6}>
        <Text size="sm" fw={500} c="brand">
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
          <TopicWordsRenderer {...props} />
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
