import { ComparisonStateItemModel } from '@/api/comparison';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import { type ComboboxItem, Select, type SelectProps } from '@mantine/core';
import { useComparisonAppState } from '../app-state';

interface NamedFilterSelectInputProps
  extends Omit<SelectProps, 'data' | 'onChange'> {
  onChange?(filter: ComparisonStateItemModel | null): void;
}

export function ComparisonSubdatasetSelectInput(
  props: NamedFilterSelectInputProps,
) {
  const { onChange, ...selectProps } = props;
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  return (
    <Select
      {...selectProps}
      data={comparisonGroups.map((item) => {
        return {
          label: item.name,
          value: item.name,
        } as ComboboxItem;
      })}
      onChange={(value) => {
        onChange?.(
          value
            ? (comparisonGroups.find((x) => x.name === value) ?? null)
            : null,
        );
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
