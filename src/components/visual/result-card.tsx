import { Card, Group, HoverCard, Stack, Text } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import React from 'react';
import { MaybeText } from '../utility/maybe';

interface ResultCardProps {
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
  info?: React.ReactNode;
  miw?: number;
}

export function ResultCard(props: ResultCardProps) {
  return (
    <Card className="flex-1" miw={props.miw ?? 250}>
      <Stack align="center" gap={4}>
        <Group justify="center">
          <Text fw={500}>{props.label}</Text>
          {props.info && (
            <HoverCard>
              <HoverCard.Target>
                <Info />
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <MaybeText className={'max-w-sm'}>{props.info}</MaybeText>
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
        {props.children}
      </Stack>
    </Card>
  );
}
