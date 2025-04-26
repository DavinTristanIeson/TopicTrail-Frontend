import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { Input, Select, Slider } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import React from 'react';

export function useVisualizationAlphaSlider() {
  const [alpha, setAlpha] = React.useState(0.05);
  const Component = (
    <Input.Wrapper
      label="Alpha"
      description="The p-value for the results of a statistic test to be considered significant."
    >
      <Slider
        value={alpha}
        min={0}
        max={1}
        step={0.01}
        onChange={setAlpha}
        label={`Alpha: ${alpha} | Confidence Level: ${100 - alpha * 100}%`}
      />
    </Input.Wrapper>
  );

  const [debouncedAlpha] = useDebouncedValue(alpha, 1000, { leading: false });

  return { Component, alpha: debouncedAlpha };
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
