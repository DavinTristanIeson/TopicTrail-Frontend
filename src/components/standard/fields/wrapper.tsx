import Colors from "@/common/constants/colors";
import {
  NumberInput,
  NumberInputProps,
  Switch,
  SwitchProps,
  TagsInput,
  TagsInputProps,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import { DateTimePicker, DateTimePickerProps } from "@mantine/dates";
import { useController } from "react-hook-form";
import Text from "../text";

interface TextFieldProps extends TextInputProps {
  name: string;
}

export function TextField(props: TextFieldProps) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <TextInput
      {...field}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}

interface DateTimeFieldProps extends DateTimePickerProps {
  name: string;
}

export function DateTimeField(props: DateTimeFieldProps) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <DateTimePicker
      {...field}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}

interface NumberFieldProps extends NumberInputProps {
  name: string;
  percentage?: boolean;
}

export function NumberField(props: NumberFieldProps) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <NumberInput
      {...field}
      value={props.percentage ? field.value * 100 : field.value}
      onChange={(e) => {
        if (e === "" || typeof e === "string") {
          field.onChange(null);
        } else {
          field.onChange(props.percentage ? e / 100 : e);
        }
      }}
      decimalScale={props.percentage ? 4 : 0}
      disabled={isSubmitting || disabled}
      error={error?.message}
      rightSection={
        props.percentage ? <Text c={Colors.foregroundDull}>%</Text> : null
      }
      {...props}
    />
  );
}

interface SwitchFieldProps extends SwitchProps {
  name: string;
}

export function SwitchField(props: SwitchFieldProps) {
  const {
    field: { value, ...restField },
    fieldState: { error },
    formState: { disabled, isSubmitting },
  } = useController({
    name: props.name,
  });

  return (
    <Switch
      checked={value}
      {...restField}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}

interface TagsFieldProps extends TagsInputProps {
  name: string;
}

export function TagsField(props: TagsFieldProps) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <TagsInput
      {...field}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}
