import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { type SelectProps } from '@mantine/core';
import React from 'react';

enum CategoricalDataFrequencyMode {
  Frequency = 'frequency',
  Proportion = 'proportion',
}

const CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY = {
  [CategoricalDataFrequencyMode.Frequency]: {
    value: CategoricalDataFrequencyMode.Frequency,
    label: 'Frequency',
    description: 'Show the absolute counts/frequencies of each category.',
  },
  [CategoricalDataFrequencyMode.Proportion]: {
    value: CategoricalDataFrequencyMode.Proportion,
    label: 'Proportion (%)',
    description: 'Show the proportion of each category as percentages.',
  },
};

export function useCategoricalDataFrequencyMode() {
  const [mode, setMode] = React.useState<string>(
    CategoricalDataFrequencyMode.Frequency,
  );
  const renderOption = useDescriptionBasedRenderOption(
    CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY,
  );
  const selectProps: SelectProps = {
    label: 'Frequency Mode',
    required: true,
    data: Object.values(CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY),
    value: mode,
    onChange(newMode) {
      if (!newMode) return;
      setMode(newMode);
    },
    allowDeselect: false,
    renderOption,
  };

  const transformFrequencies = React.useCallback(
    (frequencies: number[]) => {
      if (mode === CategoricalDataFrequencyMode.Proportion) {
        const totalFrequency = frequencies.reduce((acc, cur) => acc + cur);
        const proportions = frequencies.map(
          (frequency) => frequency / totalFrequency,
        );
        const percentages = proportions.map((proportion) => proportion * 100);
        return percentages;
      } else {
        return frequencies;
      }
    },
    [mode],
  );

  const plotlyLayoutProps = React.useMemo(() => {
    if (mode === CategoricalDataFrequencyMode.Proportion) {
      return {
        xaxis: {
          range: [0, 100],
          ticksuffix: '%',
        },
      };
    } else {
      return undefined;
    }
  }, [mode]);

  return {
    plotlyLayoutProps,
    transformFrequencies,
    selectProps,
    needsPercentage: mode === CategoricalDataFrequencyMode.Proportion,
  };
}
