import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { Group, Button, Input, Slider, Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import dayjs from 'dayjs';
import { fromPairs } from 'lodash-es';
import React from 'react';

interface UseContingencyTableAxisMultiSelectProps {
  supportedCategories: string[];
  column: SchemaColumnModel | undefined;
}

export function useContingencyTableAxisMultiSelect(
  props: UseContingencyTableAxisMultiSelectProps,
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
