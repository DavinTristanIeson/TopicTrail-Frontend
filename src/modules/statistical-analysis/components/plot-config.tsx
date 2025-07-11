import {
  Alert,
  Group,
  Input,
  type InputWrapperProps,
  Slider,
  Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Warning } from '@phosphor-icons/react';
import React from 'react';
import { pValueToConfidenceLevel } from './regression/utils';
import { formatNumber } from '@/common/utils/number';

interface UseVisualizationAlphaSlider {
  enabled?: boolean;
}

export function useVisualizationAlphaSlider(
  props: UseVisualizationAlphaSlider,
) {
  const { enabled = true } = props;
  const [alpha, setAlpha] = React.useState(0.05);
  const label = `Alpha: ${alpha} | Confidence Level: ${formatNumber(pValueToConfidenceLevel(alpha))}%`;
  const Component = (
    <Input.Wrapper
      label="Alpha"
      description="The p-value for the results of a statistic test to be considered significant. This slider doesn't discriminate between one-tailed and two-tailed p-values."
    >
      <Group>
        <Text c="brand" size="sm" fw={500} miw={240}>
          {label}
        </Text>
        <Slider
          value={alpha}
          min={0}
          max={1}
          step={0.005}
          disabled={!enabled}
          onChange={setAlpha}
          label={label}
          className="flex-1"
        />
      </Group>
    </Input.Wrapper>
  );

  const [debouncedAlpha] = useDebouncedValue(alpha, 1000, { leading: false });

  const filter = React.useCallback(
    (value: number) => {
      if (!enabled) return true;
      return value <= debouncedAlpha;
    },
    [debouncedAlpha, enabled],
  );

  if (enabled) {
    return { Component, alpha: debouncedAlpha, filter };
  } else {
    return { Component: null, alpha: 1, filter };
  }
}

interface useVisualizationMinFrequencySliderProps {
  max: number;
  inputProps?: InputWrapperProps;
}

export function useVisualizationMinFrequencySlider(
  props: useVisualizationMinFrequencySliderProps,
) {
  const { max, inputProps } = props;
  const [minFrequency, setMinFrequency] = React.useState(6);
  const Component = (
    <Input.Wrapper
      label={`Min. Frequency`}
      description="The minimal number of rows for a category to be shown. Set this to a higher number to filter out results that are too few to be relevant."
      {...inputProps}
    >
      <Group>
        <Text c="brand" fw={500} size="sm" miw={60}>
          {minFrequency} rows
        </Text>
        <Slider
          value={minFrequency}
          min={0}
          max={max}
          step={1}
          onChange={setMinFrequency}
          className="flex-1"
        />
      </Group>
    </Input.Wrapper>
  );

  const [debouncedMinFrequency] = useDebouncedValue(minFrequency, 1000, {
    leading: false,
  });

  const filter = React.useCallback(
    (value: number) => {
      return value >= debouncedMinFrequency;
    },
    [debouncedMinFrequency],
  );

  return { Component, threshold: debouncedMinFrequency, filter };
}

interface EmptyPlotWarningProps {
  invalid: boolean;
  hasAlpha: boolean;
  hasFrequency: boolean;
  hasRowsCols: boolean;
  children?: React.ReactNode;
}

export function StatisticTestEmptyPlotWarning(props: EmptyPlotWarningProps) {
  const { invalid, hasAlpha, hasFrequency, hasRowsCols, children } = props;
  if (!invalid) {
    return children;
  }
  const alternatives: string[] = [];
  if (hasRowsCols) {
    alternatives.push('choosing a few rows/columns');
  }
  if (hasAlpha) {
    alternatives.push('increasing the alpha constraint');
  }
  if (hasFrequency) {
    alternatives.push('lowering the min. frequency');
  }
  const joinedString =
    alternatives.length <= 1
      ? (alternatives[0] ?? '')
      : alternatives.slice(0, alternatives.length - 1).join(', ') +
        ', or ' +
        alternatives[alternatives.length - 1];
  return (
    <Alert color="yellow" icon={<Warning />}>
      {`There are no data to be shown; your constraints may be too strict! Try ${joinedString}`}
    </Alert>
  );
}
