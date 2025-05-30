import {
  ComparisonGroupInfoModel,
  EffectSizeResultModel,
  SignificanceResultModel,
} from '@/api/statistical-analysis';
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
  SimpleGrid,
  Switch,
  Spoiler,
  Select,
} from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import { max, sum } from 'lodash-es';
import {
  STATISTIC_TEST_METHOD_DICTIONARY,
  OMNIBUS_STATISTIC_TEST_METHOD_DICTIONARY,
  EFFECT_SIZE_DICTIONARY,
  OMNIBUS_EFFECT_SIZE_DICTIONARY,
} from '../../dictionary';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

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
      <Spoiler hideLabel="Hide" showLabel="Show More">
        {warnings.map((warning, index) => (
          <Text key={`${warning}-${index}`}>{warning}</Text>
        ))}
      </Spoiler>
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

  const [relativeToDataset, { toggle: toggleRelativeToDataset }] =
    useDisclosure(false);
  let totalCount = 0;
  if (relativeToDataset) {
    totalCount = max(groups.map((group) => group.total_count)) ?? 0;
  } else {
    totalCount = sum(groups.map((group) => group.valid_count));
  }
  if (groups.length === 0 || totalCount === 0) return null;
  const emptyCount = sum(groups.map((group) => group.empty_count)) ?? 0;
  const emptyProportion = (emptyCount / totalCount) * 100;

  const overlapCount = sum(groups.map((group) => group.overlap_count)) ?? 0;
  const overlapProportion = (overlapCount / totalCount) * 100;
  const { colors } = generateColorsFromSequence(groups);

  return (
    <Card className="w-full">
      <Stack>
        <Text fw={500}>Subdataset Proportions of {column}</Text>
        <Switch
          label="Proportion relative to whole dataset"
          description="Do you want us to only show the proportions relative to the number of rows involved in the statistic test, or relative to the whole dataset?"
          onChange={toggleRelativeToDataset}
          checked={relativeToDataset}
        />
        <Progress.Root size={48}>
          {groups.map((group, index) => {
            const groupProportion = (group.valid_count / totalCount) * 100;
            return (
              <Tooltip
                label={`${group.name}: ${group.valid_count} / ${totalCount} (${groupProportion.toFixed(2)}%) Rows`}
                key={group.name}
              >
                <Progress.Section value={groupProportion} color={colors[index]}>
                  <Text size="xs" fw={500} ta="center">
                    {group.name}
                  </Text>
                </Progress.Section>
              </Tooltip>
            );
          })}
          {emptyCount > 0 && (
            <Tooltip
              label={`Empty: ${emptyCount} / ${totalCount} (${emptyProportion.toFixed(2)}%) Rows. This number includes all rows that are included in the subdatasets, but does not contain a valid value for the column \"${column}\".`}
            >
              <Progress.Section value={emptyProportion} color="red" />
            </Tooltip>
          )}
          {overlapCount > 0 && (
            <Tooltip
              label={`Overlap: ${overlapCount} / ${totalCount} (${overlapProportion.toFixed(2)}%) Rows. This number includes all rows that are shared by two or more subdatasets.`}
            >
              <Progress.Section value={overlapProportion} color="yellow" />
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
        value={props.statistic.toFixed(3)}
        info="The value calculated by the statistic test, which is later used to calculate the p value and confidence. Ignore this if you are not familiar with statistic tests and refer to the confidence score instead."
      />
      <ResultCard
        label="P-Value"
        value={props.p_value.toFixed(3)}
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
      value={props.value.toFixed(3)}
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
    <SimpleGrid cols={{ base: 2, lg: 4 }}>
      <SignificanceResultRenderer {...props.significance} />
      <EffectSizeResultRenderer {...props.effectSize} />
    </SimpleGrid>
  );
}

export enum BinaryStatisticTestVisualizationType {
  Frequencies = 'frequencies',
  ConfidenceLevel = 'significance',
  EffectSize = 'effect-sizes',
}

const VISUALIZATION_TYPE_DICTIONARY = {
  [BinaryStatisticTestVisualizationType.Frequencies]: {
    label: 'Frequencies',
    value: BinaryStatisticTestVisualizationType.Frequencies,
    description:
      'Show the frequencies of the rows that contains the categories.',
  },
  [BinaryStatisticTestVisualizationType.ConfidenceLevel]: {
    label: 'Confidence Levels',
    value: BinaryStatisticTestVisualizationType.ConfidenceLevel,
    description:
      'Show the confidence levels of the statistic tests, wherein the category/discriminator is used to split the dataset into two subdatasets that are compared against each other.',
  },
  [BinaryStatisticTestVisualizationType.EffectSize]: {
    label: 'Effect Sizes',
    value: BinaryStatisticTestVisualizationType.EffectSize,
    description:
      'Show the effect sizes of the statistic tests, wherein the category/discriminator is used to split the dataset into two subdatasets that are compared against each other.',
  },
};

export function useBinaryStatisticTestVisualizationMethodSelect() {
  const [type, setType] = React.useState(
    BinaryStatisticTestVisualizationType.EffectSize,
  );

  const renderOption = useDescriptionBasedRenderOption(
    VISUALIZATION_TYPE_DICTIONARY,
  );

  const Component = (
    <Select
      value={type}
      onChange={setType as any}
      data={Object.values(VISUALIZATION_TYPE_DICTIONARY)}
      label="Data to Visualize"
      renderOption={renderOption}
      allowDeselect={false}
    />
  );

  return { Component, type };
}
