import { NamedTableFilterModel } from '@/api/table';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import { type ComboboxItem, Select, type SelectProps } from '@mantine/core';

interface NamedFilterSelectInputProps
  extends Omit<SelectProps, 'data' | 'onChange'> {
  data: NamedTableFilterModel[];
  onChange?(filter: NamedTableFilterModel | null): void;
}

export function NamedFilterSelectInput(props: NamedFilterSelectInputProps) {
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

type NamedFilterSelectFieldProps = NamedFilterSelectInputProps &
  IRHFMantineAdaptable<NamedFilterSelectInputProps>;
export function NamedFilterSelectField(props: NamedFilterSelectFieldProps) {
  const { mergedProps } = useRHFMantineAdapter<NamedFilterSelectFieldProps>(
    props,
    {
      extractEventValue(e) {
        return e?.name ?? null;
      },
    },
  );
  return <NamedFilterSelectInput {...mergedProps} />;
}
