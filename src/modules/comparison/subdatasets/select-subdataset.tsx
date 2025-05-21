import { ComparisonStateItemModel } from '@/api/comparison';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import { type ComboboxItem, Select, type SelectProps } from '@mantine/core';
import { useComparisonAppState } from '../app-state';

interface ComparisonSubdatasetSelectInput
  extends Omit<SelectProps, 'data' | 'onChange'> {
  onChange?(filter: ComparisonStateItemModel | null): void;
  withWholeDataset: boolean;
}

export function ComparisonSubdatasetSelectInput(
  props: ComparisonSubdatasetSelectInput,
) {
  const { onChange, withWholeDataset, ...selectProps } = props;
  const originalComparisonGroups = useComparisonAppState(
    (store) => store.groups.state,
  );
  const comparisonGroups = withWholeDataset
    ? originalComparisonGroups
    : originalComparisonGroups.filter((group) => !!group.filter);
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

type ComparisonSubdatasetSelectFieldProps = ComparisonSubdatasetSelectInput &
  IRHFMantineAdaptable<ComparisonSubdatasetSelectInput>;
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
