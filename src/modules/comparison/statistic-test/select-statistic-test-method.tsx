import {
  EffectSizeMethodEnum,
  SchemaColumnTypeEnum,
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
  EFFECT_SIZE_CONSTRAINTS,
  EFFECT_SIZE_DICTIONARY,
  STATISTIC_METHOD_CONSTRAINTS,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from './dictionary';

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
  const supportedMethods = (STATISTIC_METHOD_CONSTRAINTS[columnType] ?? []).map(
    (value) => STATISTIC_TEST_METHOD_DICTIONARY[value],
  );
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
          <Text size="xs" c="gray">
            {props.range}
          </Text>
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
  const supportedMethods = (EFFECT_SIZE_CONSTRAINTS[columnType] ?? []).map(
    (value) => EFFECT_SIZE_DICTIONARY[value],
  );
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
