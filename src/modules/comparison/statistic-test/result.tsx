import {
  EffectSizeResultModel,
  SignificanceResultModel,
  TableComparisonGroupInfoModel,
  TableComparisonResultModel,
} from '@/api/comparison';
import {
  Alert,
  Group,
  HoverCard,
  Paper,
  RingProgress,
  Stack,
  Text,
} from '@mantine/core';
import { Info, Warning } from '@phosphor-icons/react';
import React from 'react';
import {
  EFFECT_SIZE_DICTIONARY,
  GROUP_EFFECT_SIZE_DICTIONARY,
  GROUP_STATISTIC_TEST_METHOD_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from './dictionary';
import {
  EffectSizeMethodEnum,
  GroupEffectSizeMethodEnum,
  GroupStatisticTestMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';

function GroupCountsInfoCard(props: TableComparisonGroupInfoModel) {
  const emptyProportion = Math.round(
    (props.empty_count * 100) / props.total_count,
  );
  const overlapProportion = Math.round(
    (props.overlap_count * 100) / props.total_count,
  );
  const validProportion = Math.round(
    (props.valid_count * 100) / props.total_count,
  );
  return (
    <Paper className="flex-1 p-2">
      <Stack align="center" gap={0}>
        <Text ta="center" fw={500}>
          {`Sample Sizes of ${props.name}`}
        </Text>
        <RingProgress
          label={
            <div>
              <Text size="lg" fw="bold" c="brand" ta="center" lh={1}>
                {props.total_count}
              </Text>
              <Text c="gray" size="xs" ta="center" lh={1}>
                rows
              </Text>
            </div>
          }
          sections={[
            {
              value: validProportion,
              tooltip: `Valid Rows: ${props.valid_count}`,
              color: 'green',
            },
            {
              value: emptyProportion,
              tooltip: `Empty Rows: ${props.empty_count}`,
              color: 'red',
            },
            {
              value: overlapProportion,
              tooltip: `Overlapping Rows: ${props.empty_count}`,
              color: 'yellow',
            },
          ]}
        />
      </Stack>
    </Paper>
  );
}

interface StatisticTestResultCardProps {
  label: string;
  value: string;
  info?: string;
}

export function StatisticTestResultCard(props: StatisticTestResultCardProps) {
  return (
    <Paper className="flex-1 p-2">
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
    </Paper>
  );
}

function SignificanceResultRenderer(props: SignificanceResultModel) {
  const dictionaryEntry =
    STATISTIC_TEST_METHOD_DICTIONARY[props.type as StatisticTestMethodEnum] ??
    GROUP_STATISTIC_TEST_METHOD_DICTIONARY[
      props.type as GroupStatisticTestMethodEnum
    ];
  const confidence = (1 - props.p_value) * 100;
  return (
    <>
      <StatisticTestResultCard
        label={
          dictionaryEntry ? `Statistic (${dictionaryEntry.label})` : 'Statistic'
        }
        value={props.statistic.toFixed(4)}
        info="The value calculated by the statistic test, which is later used to calculate the p value and confidence. Ignore this if you are not familiar with statistic tests and refer to the confidence score instead."
      />
      <StatisticTestResultCard
        label="P-Value"
        value={props.p_value.toFixed(4)}
        info="The p value calculated from the statistic test. Ignore this if you are not familiar with statistic tests and refer to the confidence score instead"
      />
      <StatisticTestResultCard
        label="Confidence"
        value={`${confidence.toFixed(2)}%`}
        info="A high confidence means that you can be sure that both groups are different. For example, you might have a hypothesis that guests who come as a group tend to give higher ratings than guests who come alone; if this confidence value is high (generally above 95%), then you can be sure that your hypothesis is correct."
      />
    </>
  );
}

function EffectSizeResultRenderer(props: EffectSizeResultModel) {
  const dictionaryEntry =
    EFFECT_SIZE_DICTIONARY[props.type as EffectSizeMethodEnum] ??
    GROUP_EFFECT_SIZE_DICTIONARY[props.type as GroupEffectSizeMethodEnum];

  return (
    <StatisticTestResultCard
      label={
        dictionaryEntry
          ? `Effect Size (${dictionaryEntry.label})`
          : 'Effect Size'
      }
      value={props.value.toFixed(4)}
      info={dictionaryEntry.description}
    />
  );
}

interface StatisticTestResultRendererProps {
  significance: SignificanceResultModel;
  effectSize: EffectSizeResultModel;
}

export function StatisticTestResultRenderer(
  props: StatisticTestResultRendererProps,
) {
  return (
    <Group align="stretch">
      <SignificanceResultRenderer {...props.significance} />
      <EffectSizeResultRenderer {...props.effectSize} />
    </Group>
  );
}

export default function StatisticTestPageResultsRenderer(
  data: TableComparisonResultModel,
) {
  const warnings = data.warnings;
  return (
    <>
      {warnings && warnings.length > 0 && (
        <Alert
          title={`There are ${warnings.length} warning(s) regarding the groups used in this statistic test`}
          color="yellow"
          icon={<Warning size={20} />}
        >
          {warnings.map((warning, index) => (
            <Text key={`${warning}-${index}`}>{warning}</Text>
          ))}
        </Alert>
      )}
      <Group>
        {data?.groups.map((group) => (
          <GroupCountsInfoCard key={group.name} {...group} />
        ))}
      </Group>
      <Group align="stretch">
        <SignificanceResultRenderer {...data?.significance} />
        <EffectSizeResultRenderer {...data?.effect_size} />
      </Group>
    </>
  );
}
