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
  Textarea,
  TextareaProps,
} from '@mantine/core';
import { DateTimePicker, DateTimePickerProps } from '@mantine/dates';

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
  const { mergedProps } = useRHFMantineAdapter(props, {
    extractEventValue(e) {
      return e;
    },
  });
  return <NumberInput {...mergedProps} />;
}

export type PercentageFieldProps = IRHFField<
  NumberInputProps & IRHFMantineAdaptable<NumberInputProps>,
  'percentage'
> & {
  bounded?: boolean;
};

export function PercentageField(props: PercentageFieldProps) {
  const { bounded, ...restProps } = props;
  const { mergedProps } = useRHFMantineAdapter(restProps, {});
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
  const { mergedProps } = useRHFMantineAdapter<TagsFieldProps>(props, {
    extractEventValue(e) {
      return e;
    },
  });

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

export type TextareaFieldProps = IRHFField<
  TextareaProps & IRHFMantineAdaptable<TextareaProps>,
  'textarea'
>;

export function TextareaField(props: TextareaFieldProps) {
  const { mergedProps } = useRHFMantineAdapter(props, {});
  return <Textarea {...mergedProps} />;
}

export type DateTimeFieldProps = IRHFField<
  DateTimePickerProps & IRHFMantineAdaptable<DateTimePickerProps>,
  'datetime'
>;

export function DateTimeField(props: DateTimeFieldProps) {
  const { mergedProps } = useRHFMantineAdapter<DateTimeFieldProps>(props, {
    extractEventValue(e) {
      return e;
    },
  });
  return <DateTimePicker {...mergedProps} />;
}
