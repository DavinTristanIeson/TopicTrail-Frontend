import { Card, Group, HoverCard, Stack, Text } from '@mantine/core';
import { Info } from '@phosphor-icons/react';

interface StatisticTestResultCardProps {
  label: string;
  value: React.ReactNode;
  info?: string;
}

export function ResultCard(props: StatisticTestResultCardProps) {
  return (
    <Card className="flex-1" miw={250}>
      <Stack align="center" gap={4}>
        <Group justify="center">
          <Text fw={500}>{props.label}</Text>
          {props.info && (
            <HoverCard>
              <HoverCard.Target>
                <Info />
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text className={'max-w-sm'}>{props.info}</Text>
              </HoverCard.Dropdown>
            </HoverCard>
          )}
        </Group>
        <Text
          size="xl"
          c="brand"
          fw={500}
          style={{
            fontSize: 36,
          }}
        >
          {props.value}
        </Text>
      </Stack>
    </Card>
  );
}
