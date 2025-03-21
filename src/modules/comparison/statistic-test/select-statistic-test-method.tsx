import { SchemaColumnModel } from '@/api/project';
import {
  EffectSizeMethodEnum,
  SchemaColumnTypeEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import RHFField from '@/components/standard/fields';
import { SelectFieldProps } from '@/components/standard/fields/wrapper';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import {
  Group,
  Text,
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
} from '@mantine/core';

const STATISTIC_METHOD_LABELS = {
  [StatisticTestMethodEnum.Auto]: {
    label: 'Auto',
    value: StatisticTestMethodEnum.Auto,
    description:
      'Automatically infer the method based on the data types of the chosen columns.',
  },
  [StatisticTestMethodEnum.T]: {
    label: 'T Test',
    value: StatisticTestMethodEnum.T,
    description:
      "Use this method if the chosen column contains continuous data and can be assumed to be normally distributed. If the data doesn't follow a normal distribution, use Mann-Whitney U Test instead.",
  },
  [StatisticTestMethodEnum.MannWhitneyU]: {
    label: 'Mann-Whitney U Test',
    value: StatisticTestMethodEnum.MannWhitneyU,
    description:
      'Use this method if the chosen column contains ordered data (such as continuous data, temporal data, or ordered categorical data).',
  },
  [StatisticTestMethodEnum.ChiSquared]: {
    label: 'Chi-Squared Test',
    value: StatisticTestMethodEnum.MannWhitneyU,
    description:
      'Use this method if the chosen column contains unordered discrete data (such as categorical data or topic data).',
  },
};

const ORDERED_STATISTIC_METHOD_CONSTRAINTS = [
  StatisticTestMethodEnum.MannWhitneyU,
  StatisticTestMethodEnum.ChiSquared,
];
const CATEGORICAL_STATISTIC_METHOD_CONSTRAINTS = [
  StatisticTestMethodEnum.ChiSquared,
];
const STATISTIC_METHOD_CONSTRAINTS: Partial<
  Record<SchemaColumnTypeEnum, StatisticTestMethodEnum[]>
> = {
  [SchemaColumnTypeEnum.Continuous]: [
    StatisticTestMethodEnum.T,
    StatisticTestMethodEnum.MannWhitneyU,
  ],
  [SchemaColumnTypeEnum.Categorical]: CATEGORICAL_STATISTIC_METHOD_CONSTRAINTS,
  [SchemaColumnTypeEnum.MultiCategorical]:
    CATEGORICAL_STATISTIC_METHOD_CONSTRAINTS,
  [SchemaColumnTypeEnum.OrderedCategorical]:
    ORDERED_STATISTIC_METHOD_CONSTRAINTS,
  [SchemaColumnTypeEnum.Temporal]: ORDERED_STATISTIC_METHOD_CONSTRAINTS,
  [SchemaColumnTypeEnum.Topic]: CATEGORICAL_STATISTIC_METHOD_CONSTRAINTS,
};

interface StatisticMethodSelectFieldProps extends SelectFieldProps {
  columnType: SchemaColumnTypeEnum;
}

export function StatisticMethodSelectField(
  props: StatisticMethodSelectFieldProps,
) {
  const { columnType, ...restProps } = props;
  const renderOption = useDescriptionBasedRenderOption(STATISTIC_METHOD_LABELS);
  const supportedMethods = STATISTIC_METHOD_CONSTRAINTS[columnType] ?? [];
  return (
    <RHFField
      {...restProps}
      data={supportedMethods}
      type="select"
      disabled={supportedMethods.length === 0}
      error={
        supportedMethods.length === 0
          ? 'There are no supported statistic test methods for this column.'
          : undefined
      }
      renderOption={renderOption}
    />
  );
}

const EFFECT_SIZE_LABELS = {
  [EffectSizeMethodEnum.Auto]: {
    label: 'Auto',
    value: EffectSizeMethodEnum.Auto,
    range: null,
    description:
      'Automatically infer the method based on the data types of the chosen columns.',
  },
  [EffectSizeMethodEnum.CohensD]: {
    label: "Cohen's D",
    value: EffectSizeMethodEnum.CohensD,
    range: [0, Infinity],
    description:
      'Measures the difference of means between the two groups relative to their standard deviations. A value of 0.5 means that the means of both groups differ by 0.5 standard deviations.',
  },
  [EffectSizeMethodEnum.MeanDifference]: {
    label: 'Difference of Means',
    range: [0, Infinity],
    value: EffectSizeMethodEnum.MeanDifference,
    description:
      'Measures the absolute difference of means between the two groups.',
  },
  [EffectSizeMethodEnum.MedianDifference]: {
    label: 'Difference of Medians',
    range: [0, Infinity],
    value: EffectSizeMethodEnum.MedianDifference,
    description:
      'Measures the absolute difference of medians between the two groups.',
  },
  [EffectSizeMethodEnum.RankBiserialCorrelation]: {
    label: 'Rank Biserial Correlation',
    range: [-1, 1],
    value: EffectSizeMethodEnum.RankBiserialCorrelation,
    description:
      'Measures the difference in ranks between the two groups. A negative number approaching -1 means that the first group has higher ranks than the second group, while a positive number approaching 1 means that the first group has lower ranks than the second group.',
  },
  [EffectSizeMethodEnum.CramerV]: {
    label: "Cramer's V",
    range: [0, 1],
    value: EffectSizeMethodEnum.CramerV,
    description:
      'Measures the difference of frequency distributions between the two groups. A higher number indicates a greater difference between both groups.',
  },
};

const ORDERED_EFFECT_SIZE_CONSTRAINTS = [
  EffectSizeMethodEnum.RankBiserialCorrelation,
  EffectSizeMethodEnum.CramerV,
];
const CATEGORICAL_EFFECT_SIZE_CONSTRAINTS = [EffectSizeMethodEnum.CramerV];
const EFFECT_SIZE_CONSTRAINTS: Partial<
  Record<SchemaColumnTypeEnum, EffectSizeMethodEnum[]>
> = {
  [SchemaColumnTypeEnum.Continuous]: [
    EffectSizeMethodEnum.CohensD,
    EffectSizeMethodEnum.MeanDifference,
    EffectSizeMethodEnum.MedianDifference,
    EffectSizeMethodEnum.RankBiserialCorrelation,
  ],
  [SchemaColumnTypeEnum.Categorical]: CATEGORICAL_EFFECT_SIZE_CONSTRAINTS,
  [SchemaColumnTypeEnum.MultiCategorical]: CATEGORICAL_EFFECT_SIZE_CONSTRAINTS,
  [SchemaColumnTypeEnum.OrderedCategorical]: ORDERED_EFFECT_SIZE_CONSTRAINTS,
  [SchemaColumnTypeEnum.Temporal]: ORDERED_EFFECT_SIZE_CONSTRAINTS,
  [SchemaColumnTypeEnum.Topic]: CATEGORICAL_EFFECT_SIZE_CONSTRAINTS,
};

function EffectSizeSelectInputRenderOption({
  option,
}: ComboboxLikeRenderOptionInput<ComboboxItem>) {
  const props = EFFECT_SIZE_LABELS[option.value as EffectSizeMethodEnum];
  if (!props) {
    return option.label;
  }
  return (
    <div>
      <Group gap={4}>
        <Text size="sm">{props.label}</Text>
        {props.range && (
          <Text size="sm">{`(${props.range[0]}, ${props.range[1]})`}</Text>
        )}
      </Group>
      <Text size="xs" c="gray">
        {props.description}
      </Text>
    </div>
  );
}

export function EffectSizeSelectField(props: StatisticMethodSelectFieldProps) {
  const { columnType, ...restProps } = props;
  const supportedMethods = EFFECT_SIZE_CONSTRAINTS[columnType] ?? [];
  return (
    <RHFField
      {...restProps}
      type="select"
      renderOption={EffectSizeSelectInputRenderOption}
      data={supportedMethods}
      disabled={supportedMethods.length === 0}
      error={
        supportedMethods.length === 0
          ? 'There are no supported effect sizes for this column.'
          : undefined
      }
    />
  );
}
