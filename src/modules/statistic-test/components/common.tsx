import {
  ComparisonGroupInfoModel,
  EffectSizeResultModel,
  SignificanceResultModel,
} from '@/api/statistic-test';
import {
  StatisticTestMethodEnum,
  OmnibusStatisticTestMethodEnum,
  EffectSizeMethodEnum,
  OmnibusEffectSizeMethodEnum,
} from '@/common/constants/enum';
import { ResultCard } from '@/components/visual/result-card';
import {
  Text,
  Alert,
  Card,
  Stack,
  RingProgress,
  Progress,
  Tooltip,
  Group,
} from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import { max, sum } from 'lodash-es';
import {
  STATISTIC_TEST_METHOD_DICTIONARY,
  OMNIBUS_STATISTIC_TEST_METHOD_DICTIONARY,
  EFFECT_SIZE_DICTIONARY,
  OMNIBUS_EFFECT_SIZE_DICTIONARY,
} from '../dictionary';
import { generateColorsFromSequence } from '@/common/utils/colors';

interface StatisticTestWarningsRendererProps {
  warnings: string[] | null | undefined;
}

export function StatisticTestWarningsRenderer(
  props: StatisticTestWarningsRendererProps,
) {
  const { warnings } = props;
  if (!warnings || warnings.length === 0) {
    return null;
  }
  return (
    <Alert
      title={`There are ${warnings.length} warning(s)`}
      color="yellow"
      icon={<Warning size={20} />}
    >
      {warnings.map((warning, index) => (
        <Text key={`${warning}-${index}`}>{warning}</Text>
      ))}
    </Alert>
  );
}

export function GroupCountsInfoCard(props: ComparisonGroupInfoModel) {
  const emptyProportion = Math.round(
    (props.empty_count * 100) / props.total_count,
  );
  const validProportion = Math.round(
    (props.valid_count * 100) / props.total_count,
  );
  return (
    <Card className="flex-1">
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
          ]}
        />
      </Stack>
    </Card>
  );
}

interface GroupCountsRendererProps {
  column: string;
  groups: ComparisonGroupInfoModel[];
}

export function GroupCountsRenderer(props: GroupCountsRendererProps) {
  const { column, groups } = props;
  const totalCount = max(groups.map((group) => group.total_count)) ?? 0;
  const emptyCount = sum(groups.map((group) => group.empty_count)) ?? 0;
  const emptyProportion = (emptyCount / totalCount) * 100;
  if (groups.length === 0 || totalCount === 0) return null;
  const { colors } = generateColorsFromSequence(groups);

  return (
    <Card className="w-full">
      <Stack>
        <Text fw={500}>Subdataset Proportions of {column}</Text>
        <Progress.Root size={32}>
          {groups.map((group, index) => {
            const groupProportion = (group.valid_count / totalCount) * 100;
            return (
              <Tooltip
                label={`${group.name}: ${group.valid_count} (${groupProportion.toFixed(2)}%) Rows`}
                key={group.name}
              >
                <Progress.Section value={groupProportion} color={colors[index]}>
                  {group.name}
                </Progress.Section>
              </Tooltip>
            );
          })}
          {emptyCount > 0 && (
            <Tooltip
              label={`Empty: ${emptyCount} (${emptyProportion.toFixed(2)}%) Rows. This number includes all rows that are included in the subdatasets, but does not contain a valid value for the column \"${column}\".`}
            >
              <Progress.Section value={emptyProportion} color="red">
                Empty Rows
              </Progress.Section>
            </Tooltip>
          )}
        </Progress.Root>
      </Stack>
    </Card>
  );
}

function SignificanceResultRenderer(props: SignificanceResultModel) {
  const dictionaryEntry =
    STATISTIC_TEST_METHOD_DICTIONARY[props.type as StatisticTestMethodEnum] ??
    OMNIBUS_STATISTIC_TEST_METHOD_DICTIONARY[
      props.type as OmnibusStatisticTestMethodEnum
    ];
  const confidence = (1 - props.p_value) * 100;
  return (
    <>
      <ResultCard
        label={
          dictionaryEntry ? `Statistic (${dictionaryEntry.label})` : 'Statistic'
        }
        value={props.statistic.toFixed(4)}
        info="The value calculated by the statistic test, which is later used to calculate the p value and confidence. Ignore this if you are not familiar with statistic tests and refer to the confidence score instead."
      />
      <ResultCard
        label="P-Value"
        value={props.p_value.toFixed(4)}
        info="The p value calculated from the statistic test. Ignore this if you are not familiar with statistic tests and refer to the confidence score instead"
      />
      <ResultCard
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
    OMNIBUS_EFFECT_SIZE_DICTIONARY[props.type as OmnibusEffectSizeMethodEnum];

  return (
    <ResultCard
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

interface SignificanceAndEffectSizeComponentsProps {
  significance: SignificanceResultModel;
  effectSize: EffectSizeResultModel;
}

export function SignificanceAndEffectSizeComponents(
  props: SignificanceAndEffectSizeComponentsProps,
) {
  return (
    <Group align="stretch" wrap="wrap">
      <SignificanceResultRenderer {...props.significance} />
      <EffectSizeResultRenderer {...props.effectSize} />
    </Group>
  );
}
