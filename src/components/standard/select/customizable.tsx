import {
  Combobox,
  ComboboxItem,
  Input,
  InputBase,
  Loader,
  useCombobox,
} from "@mantine/core";
import React from "react";

interface CustomizableSelectProps<T extends ComboboxItem> {
  onChange(value: T | null): void;
  loading?: boolean;
  value: string | null;
  data: T[];

  label?: React.ReactNode;
  required?: boolean;
  placeholder?: React.ReactNode;

  ItemRenderer(item: T): React.ReactNode;
}

export default function CustomizableSelect<T extends ComboboxItem>(
  props: CustomizableSelectProps<T>
) {
  const {
    onChange,
    loading,
    data,
    value,
    label,
    placeholder,
    required,
    ItemRenderer,
  } = props;
  const store = useCombobox();
  const selectedComboboxItem = React.useMemo(
    () => data.find((x) => x.value === value),
    [value, data]
  );
  return (
    <Combobox
      store={store}
      onOptionSubmit={(value) => {
        if (value == null) {
          onChange(null);
          return;
        }
        const option = data.find((x) => x.value === value);
        onChange(option ?? null);
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          label={label}
          required={required}
          rightSection={loading ? <Loader /> : <Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => store.toggleDropdown()}
        >
          {selectedComboboxItem?.label ?? (
            <Input.Placeholder>{placeholder}</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {data.map((item) => (
            <Combobox.Option value={item.value} key={item.value}>
              {ItemRenderer ? ItemRenderer(item) : item.label}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
