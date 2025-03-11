import {
  NumberInput,
  NumberInputProps,
  Switch,
  SwitchProps,
  TagsInput,
  TagsInputProps,
  TextInput,
  TextInputProps,
  Select,
  SelectProps,
} from '@mantine/core';
import {
  IRHFField,
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from './adapter';
import { PercentageInput } from '../inputs/wrapper';

export type TextFieldProps = IRHFField<
  TextInputProps & IRHFMantineAdaptable<TextInputProps>,
  'text'
>;

export function TextField(props: TextFieldProps) {
  const { mergedProps } = useRHFMantineAdapter(props, {});
  return <TextInput {...mergedProps} />;
}

export type NumberFieldProps = IRHFField<
  NumberInputProps & IRHFMantineAdaptable<NumberInputProps>,
  'number'
>;

export function NumberField(props: NumberFieldProps) {
  const { mergedProps } = useRHFMantineAdapter(props, {});
  return <NumberInput {...mergedProps} />;
}

export type PercentageFieldProps = IRHFField<
  NumberInputProps & IRHFMantineAdaptable<NumberInputProps>,
  'percentage'
> & {
  bounded?: boolean;
};

export function PercentageField(props: PercentageFieldProps) {
  const { bounded } = props;
  const { mergedProps } = useRHFMantineAdapter(props, {});
  return (
    <PercentageInput
      {...mergedProps}
      min={bounded ? 0 : undefined}
      max={bounded ? 100 : undefined}
    />
  );
}

export type SwitchFieldProps = IRHFField<
  SwitchProps & IRHFMantineAdaptable<SwitchProps>,
  'switch'
>;

export function SwitchField(props: SwitchFieldProps) {
  const { mergedProps } = useRHFMantineAdapter<SwitchFieldProps>(props, {
    extractEventValue(e) {
      return e.target.checked;
    },
  });
  return <Switch {...mergedProps} />;
}

export type TagsFieldProps = IRHFField<
  TagsInputProps & IRHFMantineAdaptable<TagsInputProps>,
  'tags'
>;

export function TagsField(props: TagsFieldProps) {
  const { mergedProps } = useRHFMantineAdapter(props, {});

  return <TagsInput {...mergedProps} />;
}

export type SelectFieldProps = IRHFField<
  SelectProps & IRHFMantineAdaptable<SelectProps>,
  'select'
>;

export function SelectField(props: SelectFieldProps) {
  const { mergedProps } = useRHFMantineAdapter(props, {
    extractEventValue(e) {
      return e;
    },
  });
  return <Select {...mergedProps} />;
}
