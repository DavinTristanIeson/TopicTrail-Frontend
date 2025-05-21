import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import {
  Alert,
  Group,
  Input,
  type InputWrapperProps,
  Select,
  Slider,
  Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Warning } from '@phosphor-icons/react';
import React from 'react';

export function useVisualizationAlphaSlider() {
  const [alpha, setAlpha] = React.useState(0.05);
  const label = `Alpha: ${alpha} | Confidence Level: ${Math.round(100 - alpha * 100)}%`;
  const Component = (
    <Input.Wrapper
      label="Alpha"
      description="The p-value for the results of a statistic test to be considered significant."
    >
      <Group>
        <Text c="brand" size="sm" fw={500} miw={240}>
          {label}
        </Text>
        <Slider
          value={alpha}
          min={0}
          max={1}
          step={0.01}
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
      return value <= debouncedAlpha;
    },
    [debouncedAlpha],
  );

  return { Component, alpha: debouncedAlpha, filter };
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

export enum BinaryStatisticTestVisualizationType {
  Frequencies = 'frequencies',
  ConfidenceLevel = 'significance',
  EffectSize = 'effect-sizes',
}

const VISUALIZATION_TYPE_DICTIONARY = {
  [BinaryStatisticTestVisualizationType.Frequencies]: {
    label: 'Frequencies',
    value: BinaryStatisticTestVisualizationType.Frequencies,
    description:
      'Show the frequencies of the rows that contains the categories.',
  },
  [BinaryStatisticTestVisualizationType.ConfidenceLevel]: {
    label: 'Confidence Levels',
    value: BinaryStatisticTestVisualizationType.ConfidenceLevel,
    description:
      'Show the confidence levels of the statistic tests, wherein the category/discriminator is used to split the dataset into two subdatasets that are compared against each other.',
  },
  [BinaryStatisticTestVisualizationType.EffectSize]: {
    label: 'Effect Sizes',
    value: BinaryStatisticTestVisualizationType.EffectSize,
    description:
      'Show the effect sizes of the statistic tests, wherein the category/discriminator is used to split the dataset into two subdatasets that are compared against each other.',
  },
};

export function useBinaryStatisticTestVisualizationMethodSelect() {
  const [type, setType] = React.useState(
    BinaryStatisticTestVisualizationType.EffectSize,
  );

  const renderOption = useDescriptionBasedRenderOption(
    VISUALIZATION_TYPE_DICTIONARY,
  );

  const Component = (
    <Select
      value={type}
      onChange={setType as any}
      data={Object.values(VISUALIZATION_TYPE_DICTIONARY)}
      label="Data to Visualize"
      renderOption={renderOption}
      allowDeselect={false}
    />
  );

  return { Component, type };
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
