import { TopicModel } from '@/api/topic';
import Colors from '@/common/constants/colors';
import { Stack, Group, Badge, Text } from '@mantine/core';

export function TopicWordsRenderer(props: TopicModel) {
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

export function TopicInfo(props: TopicModel) {
  return (
    <Stack>
      <Group gap={6}>
        <Text size="sm" c="brand" fw={500}>
          {props.id + 1}.
        </Text>
        <Text size="sm" fw={500} c="brand">
          {props.label}
        </Text>
        <Text size="xs" c="gray">{`(${props.frequency} rows)`}</Text>
      </Group>
      <div>
        <Text size="xs" c="gray">
          Topic Words
        </Text>
        <TopicWordsRenderer {...props} />
      </div>
      <div>
        {props.tags && (
          <>
            <Text size="xs">Tags</Text>
            <Group>
              {props.tags.map((tag) => (
                <Badge key={tag} variant="light" radius="sm">
                  {tag}
                </Badge>
              ))}
            </Group>
          </>
        )}
      </div>
      {props.description && <Text size="xs">{props.description}</Text>}
    </Stack>
  );
}
