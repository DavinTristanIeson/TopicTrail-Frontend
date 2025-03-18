import {
  ActionIcon,
  Pill,
  PillsInput,
  PillsInputProps,
  TagsInput,
  TagsInputProps,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import React from 'react';
import {
  IRHFField,
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from './adapter';
import { Plus } from '@phosphor-icons/react';
import { DateTimePicker } from '@mantine/dates';

interface MultipleNumberInputProps
  extends Omit<TagsInputProps, 'value' | 'onChange' | 'defaultValue'> {
  value?: number[];
  defaultValue?: number[];
  onChange?(value: number[]): void;
  ordered?: boolean;
}

export function MultipleNumberInput(props: MultipleNumberInputProps) {
  const { ordered, ...restProps } = props;
  const [value, setValue] = useUncontrolled<number[]>({
    defaultValue: props.defaultValue,
    value: props.value,
    onChange: props.onChange,
  });

  const onChange = React.useCallback((tags: string[]) => {
    const newValues = tags
      .map((tag) => parseInt(tag, 10))
      .filter((tag) => !isNaN(tag));
    if (ordered) {
      newValues.sort((a, b) => a - b);
    }
    setValue(newValues);
  }, []);

  const tagsInputValue = React.useMemo(() => {
    return value.map(String);
  }, [value]);

  return (
    <TagsInput
      {...restProps}
      defaultValue={undefined}
      value={tagsInputValue}
      onChange={onChange}
    />
  );
}

export type MultipleNumberFieldProps = IRHFField<
  MultipleNumberInputProps & IRHFMantineAdaptable<MultipleNumberInputProps>,
  'multiple-number'
>;

export function MultipleNumberField(props: MultipleNumberFieldProps) {
  const { mergedProps } = useRHFMantineAdapter(props, {
    extractEventValue(e) {
      return e;
    },
  });
  return <MultipleNumberInput {...mergedProps} />;
}

interface MultipleDateTimeInputProps
  extends Omit<PillsInputProps, 'onChange' | 'defaultValue' | 'value'> {
  value?: Date[];
  defaultValue?: Date[];
  onChange?(value: Date[]): void;
}

export function MultipleDateTimeInput(props: MultipleDateTimeInputProps) {
  const {
    defaultValue,
    value: controlledValue,
    onChange: controlledOnChange,
    ...restProps
  } = props;
  const [value, setValue] = useUncontrolled({
    defaultValue: defaultValue,
    value: controlledValue,
    onChange: controlledOnChange,
  });

  const datetimePickerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <PillsInput
        description="Date time is recorded in UTC time."
        {...restProps}
      >
        <Pill.Group>
          {value.map((date, index) => (
            <Pill
              key={`${date.toString()}-${index}`}
              onRemove={() => {
                const next = value.slice();
                setValue(next);
              }}
            >
              {date.toUTCString()}
            </Pill>
          ))}
          <ActionIcon
            variant="subtle"
            onClick={() => {
              datetimePickerRef.current?.click();
            }}
          >
            <Plus />
          </ActionIcon>
        </Pill.Group>
      </PillsInput>
      <DateTimePicker
        dropdownType="modal"
        className="hidden"
        ref={datetimePickerRef}
      />
    </>
  );
}

export type MultipleDateTimeFieldProps = IRHFField<
  MultipleDateTimeInputProps & IRHFMantineAdaptable<MultipleDateTimeInputProps>,
  'multiple-datetime'
>;
export function MultipleDateTimeField(props: MultipleDateTimeFieldProps) {
  const { mergedProps } = useRHFMantineAdapter(props, {
    extractEventValue(e) {
      return e;
    },
  });
  return <MultipleDateTimeInput {...mergedProps} />;
}
