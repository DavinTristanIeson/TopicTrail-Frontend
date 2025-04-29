import {
  EffectSizeResultModel,
  SignificanceResultModel,
} from '@/api/comparison';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { StatisticTestResultRenderer } from '@/modules/comparison/statistic-test/result';
import {
  Alert,
  Button,
  Collapse,
  Input,
  type InputWrapperProps,
  Select,
  Slider,
  Stack,
  Text,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { TestTube, Warning } from '@phosphor-icons/react';
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
      label="Min. Frequency"
      description="The minimal number of rows for a category to be shown. Set this to a higher number to filter out results that are too few to be relevant."
      {...inputProps}
    >
      <Slider
        value={minFrequency}
        min={0}
        max={max}
        step={1}
        onChange={setMinFrequency}
      />
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

interface VisualizationCorrelationStatisticTestResultsRendererProps {
  significance: SignificanceResultModel;
  effectSize: EffectSizeResultModel;
  column1: string;
  column2: string;
  warnings: string[];
}

export function VisualizationCorrelationStatisticTestResultsRenderer(
  props: VisualizationCorrelationStatisticTestResultsRendererProps,
) {
  const { significance, effectSize, column1, column2, warnings } = props;
  const [opened, { toggle }] = useDisclosure(true);
  return (
    <>
      <Button onClick={toggle} variant="subtle" leftSection={<TestTube />}>
        {opened ? 'Hide' : 'Show'} Results
      </Button>
      <Collapse in={opened}>
        <Stack>
          <Text ta="center" fw={500} size="lg">
            Does {column1} influence {column2}?
          </Text>
          <StatisticTestResultRenderer
            effectSize={effectSize}
            significance={significance}
          />
          {warnings.length > 0 && (
            <Alert color="yellow" icon={<Warning />}>
              {warnings.map((warning) => (
                <Text inherit key={warning}>
                  {warning}
                </Text>
              ))}
            </Alert>
          )}
        </Stack>
      </Collapse>
    </>
  );
}
