import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { Group, Button, type SelectProps } from '@mantine/core';
import dayjs from 'dayjs';
import { fromPairs, sum } from 'lodash-es';
import React from 'react';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

interface useCategoriesAxisMultiSelectProps {
  supportedCategories: string[];
  column: SchemaColumnModel | undefined;
}

export function useCategoriesAxisMultiSelect(
  props: useCategoriesAxisMultiSelectProps,
) {
  const { supportedCategories, column } = props;
  const [categories, setCategories] =
    React.useState<string[]>(supportedCategories);

  const indexMap = React.useMemo(() => {
    return fromPairs(
      supportedCategories.map((category, index) => [category, index]),
    );
  }, [supportedCategories]);

  const chosenIndices = React.useMemo(() => {
    return categories
      .map((category) => indexMap[category]!)
      .filter((category) => category != null);
  }, [categories, indexMap]);

  const inputContainer = (children: React.ReactNode) => (
    <Group>
      <div className="flex-1">{children}</div>
      <Button
        onClick={() => {
          if (categories.length === supportedCategories.length) {
            setCategories([]);
          } else {
            setCategories(supportedCategories);
          }
        }}
        variant="subtle"
      >
        {categories.length === supportedCategories.length
          ? 'Deselect'
          : 'Select'}{' '}
        All
      </Button>
      <Button
        onClick={() => {
          if (!column) {
            setCategories((categories) => categories.slice().sort());
            return;
          }
          if (column.type === SchemaColumnTypeEnum.Temporal) {
            setCategories((categories) => {
              const newCategories = categories
                .map(
                  (category) =>
                    [dayjs(category), category] as [dayjs.Dayjs, string],
                )
                .filter((x) => x[0].isValid())
                .sort((a, b) => a[0].diff(b[0]))
                .map((x) => x[1]);
              return newCategories;
            });
          } else if (
            column.type === SchemaColumnTypeEnum.OrderedCategorical &&
            column.category_order
          ) {
            const categoryOrder = column.category_order!;
            setCategories((categories) => {
              const newCategories = categories
                .map(
                  (category) =>
                    [category, categoryOrder.indexOf(category)] as [
                      string,
                      number,
                    ],
                )
                .map((x) => (x[1] === -1 ? ([x[0], 0] as [string, number]) : x))
                .sort((a, b) => a[1] - b[1])
                .map((x) => x[0]);
              return newCategories;
            });
          } else {
            setCategories((categories) => categories.slice().sort());
          }
        }}
        variant="subtle"
      >
        Sort
      </Button>
    </Group>
  );

  const multiSelectProps = {
    value: categories,
    inputContainer,
    onChange: setCategories,
    data: supportedCategories,
    searchable: true,
  };
  return {
    multiSelectProps,
    chosenIndices,
  };
}

// region CategoricalData

export enum CategoricalDataFrequencyMode {
  Frequency = 'frequency',
  Proportion = 'proportion',
}

export const CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY = {
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

export function useCategoricalDataFrequencyMode(
  mode: CategoricalDataFrequencyMode,
) {
  const transformFrequencies = React.useCallback(
    (frequencies: number[]) => {
      if (mode === CategoricalDataFrequencyMode.Proportion) {
        const totalFrequency = sum(frequencies);
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
        range: [0, 100],
        ticksuffix: '%',
        minallowed: 0,
      };
    } else {
      return {
        minallowed: 0,
      };
    }
  }, [mode]);

  return { plotlyLayoutProps, transformFrequencies };
}

export function useCategoricalDataFrequencyModeState() {
  const [mode, setMode] = React.useState(
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
      setMode(newMode as CategoricalDataFrequencyMode);
    },
    allowDeselect: false,
    renderOption,
  };

  const { transformFrequencies, plotlyLayoutProps } =
    useCategoricalDataFrequencyMode(mode);

  return {
    plotlyLayoutProps,
    transformFrequencies,
    selectProps,
    needsPercentage: mode === CategoricalDataFrequencyMode.Proportion,
  };
}
