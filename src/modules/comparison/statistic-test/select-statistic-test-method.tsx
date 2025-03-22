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
import {
  EFFECT_SIZE_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from './dictionary';

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
  const renderOption = useDescriptionBasedRenderOption(
    STATISTIC_TEST_METHOD_DICTIONARY,
  );
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
  const props = EFFECT_SIZE_DICTIONARY[option.value as EffectSizeMethodEnum];
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
