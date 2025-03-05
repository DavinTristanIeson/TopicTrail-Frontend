import React from 'react';

export type UserTriggeredInputComponentProps<T> = {
  setValue: React.Dispatch<React.SetStateAction<T>>;
  trigger: (callback?: (value: T) => T) => void;
  reset: () => void;
  value: T;
};

export type UserTriggeredInputProps<T> = {
  initialValue: T;
  onChange: (payload: T) => void;
  children: React.FC<UserTriggeredInputComponentProps<T>>;
};

export function UserTriggeredInput<T>(props: UserTriggeredInputProps<T>) {
  const { initialValue, onChange, children: Input } = props;
  const [value, setValue] = React.useState(initialValue);

  const trigger = React.useCallback(
    (callback?: (value: T) => T) => {
      if (callback) {
        const newValue = callback(value);
        onChange(newValue);
        setValue(newValue);
      } else {
        onChange(value);
      }
    },
    [onChange, value],
  );

  const reset = React.useCallback(() => {
    setValue(initialValue);
    onChange(initialValue);
  }, [initialValue, onChange]);

  return (
    <Input setValue={setValue} value={value} trigger={trigger} reset={reset} />
  );
}
