import React from 'react';
import { useController } from 'react-hook-form';

interface OnBlurInputRendererProps<TValue> {
  value: TValue;
  onChange(value: TValue): void;
  onBlur?: (e: React.FocusEvent) => void;
}

interface OnBlurInputProps<TValue> extends OnBlurInputRendererProps<TValue> {
  children(props: Required<OnBlurInputRendererProps<TValue>>): React.ReactNode;
}

export function useOnBlurChange<TValue>(
  _value: TValue,
  onChange: (value: TValue) => void,
  _onBlur?: (e: React.FocusEvent) => void,
) {
  const [value, setValue] = React.useState<TValue>(_value);
  const onBlur = React.useCallback(
    (e: React.FocusEvent) => {
      onChange(value);
      _onBlur?.(e);
    },
    [_onBlur, onChange, value],
  );

  // Synchronize value from props and value from state
  React.useEffect(() => {
    setValue(_value);
  }, [_value]);

  return { value, onBlur, setValue };
}

export function OnBlurInput<TValue>(props: OnBlurInputProps<TValue>) {
  const { value: _value, children, onChange, onBlur: _onBlur } = props;
  const { value, onBlur, setValue } = useOnBlurChange(
    _value,
    onChange,
    _onBlur,
  );
  return children({ value, onChange: setValue, onBlur });
}

interface OnBlurFieldRendererProps<TValue>
  extends OnBlurInputRendererProps<TValue> {
  error?: string;
  disabled?: boolean;
}

interface OnBlurFieldProps<TValue> {
  name: string;
  noError?: boolean;
  children(props: OnBlurFieldRendererProps<TValue>): React.ReactNode;
  onAfterChange?: (value: TValue) => void;
  onChange?: (value: TValue) => void;
}

export function OnBlurField<TValue>(props: OnBlurFieldProps<TValue>) {
  const { field, fieldState, formState } = useController({
    name: props.name,
  });
  return (
    <OnBlurInput
      value={field.value}
      onChange={(value) => {
        if (props.onChange) {
          return props.onChange?.(value);
        }
        field.onChange(value);
        props.onAfterChange?.(value);
      }}
    >
      {(renderProps) =>
        props.children({
          ...renderProps,
          disabled: formState.disabled,
          error: props.noError ? undefined : fieldState.error?.message,
        })
      }
    </OnBlurInput>
  );
}
