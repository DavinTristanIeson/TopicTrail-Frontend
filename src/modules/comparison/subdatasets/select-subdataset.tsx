import { ComparisonStateItemModel } from '@/api/comparison';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import { type ComboboxItem, Select, type SelectProps } from '@mantine/core';

interface NamedFilterSelectInputProps
  extends Omit<SelectProps, 'data' | 'onChange'> {
  data: ComparisonStateItemModel[];
  onChange?(filter: ComparisonStateItemModel | null): void;
}

export function ComparisonSubdatasetSelectInput(
  props: NamedFilterSelectInputProps,
) {
  const { onChange, data, ...selectProps } = props;
  return (
    <Select
      {...selectProps}
      data={data.map((item) => {
        return {
          label: item.name,
          value: item.name,
        } as ComboboxItem;
      })}
      onChange={(value) => {
        onChange?.(value ? (data.find((x) => x.name === value) ?? null) : null);
      }}
      placeholder="Pick a group"
    />
  );
}

type ComparisonSubdatasetSelectFieldProps = NamedFilterSelectInputProps &
  IRHFMantineAdaptable<NamedFilterSelectInputProps>;
export function ComparisonSubdatasetSelectField(
  props: ComparisonSubdatasetSelectFieldProps,
) {
  const { mergedProps } =
    useRHFMantineAdapter<ComparisonSubdatasetSelectFieldProps>(props, {
      extractEventValue(e) {
        return e?.name ?? null;
      },
    });
  return <ComparisonSubdatasetSelectInput {...mergedProps} />;
}
