import { NumberInput, type NumberInputProps, Text } from '@mantine/core';
import React from 'react';

export function PercentageInput(props: NumberInputProps) {
  const {
    onChange: controlledOnChange,
    value: controlledValue,
    ...restProps
  } = props;
  const onChange = controlledOnChange
    ? (value: number | string) => {
        if (typeof value === 'number') {
          controlledOnChange(value / 100);
        } else {
          controlledOnChange(value);
        }
      }
    : undefined;
  return (
    <NumberInput
      {...restProps}
      value={typeof controlledValue === 'number' ? controlledValue * 100 : ''}
      onChange={onChange}
      decimalScale={2}
      rightSection={<Text c="gray">%</Text>}
    />
  );
}
