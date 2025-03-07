import { useDebouncedCallback } from '@mantine/hooks';
import React from 'react';
interface Props<T> {
  setValue: React.Dispatch<T>;
  value: T;
  children: (value: T, onAfterChange: (value: T) => void) => React.ReactNode;
  timeout?: number;
}
export function DebouncedInput<T>(props: Props<T>) {
  const { timeout = 800 } = props;
  const [value, setValue] = React.useState<T>(props.value);

  const onAfterChange = useDebouncedCallback(
    (value: T) => props.setValue(value),
    timeout,
  );

  return props.children(value, (value) => {
    setValue(value);
    onAfterChange(value);
  });
}
