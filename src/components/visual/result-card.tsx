import { Card, Group, HoverCard, Stack, Text } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import React from 'react';
import { MaybeText } from '../utility/maybe';
import { formatNumber } from '@/common/utils/number';

interface ResultCardProps {
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
  info?: React.ReactNode;
  miw?: number;
  percentage?: boolean;
}

const ResultCardText = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithChildren
>(function ResultCardText(props, ref) {
  return (
    <Text
      ref={ref}
      size="xl"
      c="brand"
      fw={500}
      style={{
        fontSize: 36,
      }}
    >
      {props.children}
    </Text>
  );
});

interface ResultCardNumberRendererProps {
  value: number;
  suffix: string;
}

function ResultCardNumberRenderer(props: ResultCardNumberRendererProps) {
  const { value, suffix } = props;
  const stringifiedNumber = value.toLocaleString(undefined, {
    maximumFractionDigits: 3,
    useGrouping: false,
  });
  const maxStringifiedNumber = value.toString();

  if (
    maxStringifiedNumber.length === stringifiedNumber.length &&
    !maxStringifiedNumber.includes('e')
  ) {
    return <ResultCardText>{formatNumber(value) + suffix}</ResultCardText>;
  }
  return (
    <HoverCard position="bottom" withArrow>
      <HoverCard.Target>
        <div>
          <ResultCardText>{formatNumber(value) + suffix}</ResultCardText>
        </div>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text fw={500} ta="center">
          Full Value
        </Text>
        <ResultCardText>{props.value + suffix}</ResultCardText>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export function ResultCard(props: ResultCardProps) {
  const { miw, label, info, value, children, percentage } = props;
  const suffix = percentage ? '%' : '';

  return (
    <Card className="flex-1" miw={miw ?? 250}>
      <Stack align="center" gap={4}>
        <Group justify="center">
          <Text fw={500}>{label}</Text>
          {info && (
            <HoverCard>
              <HoverCard.Target>
                <Info />
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <MaybeText className={'max-w-sm'}>{info}</MaybeText>
              </HoverCard.Dropdown>
            </HoverCard>
          )}
        </Group>
        {typeof value === 'number' ? (
          <ResultCardNumberRenderer value={value} suffix={suffix} />
        ) : value != null ? (
          <ResultCardText>{value}</ResultCardText>
        ) : null}
        {children}
      </Stack>
    </Card>
  );
}
