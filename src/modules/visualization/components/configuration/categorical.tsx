import { SchemaColumnModel } from '@/api/project';
import {
  SchemaColumnTypeEnum,
  TemporalPrecisionEnum,
} from '@/common/constants/enum';
import { type SelectProps } from '@mantine/core';
import dayjs from 'dayjs';
import { fromPairs, identity, sum, uniq } from 'lodash-es';
import React from 'react';
import {
  useDescriptionBasedRenderOption,
  useMultiSelectSelectAllCheckbox,
} from '@/components/visual/select';
import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationFrequencyDistributionModel } from '@/api/table';
import { useProjectColumn } from '@/modules/project/context';
import { useDebouncedValue } from '@mantine/hooks';
import { formatTemporalValueByPrecision } from '@/modules/table/cell';

interface useCategoriesAxisMultiSelectProps {
  supportedCategories: string[];
  column: SchemaColumnModel | undefined;
}

export function useCategoriesAxisMultiSelect(
  props: useCategoriesAxisMultiSelectProps,
) {
  const { supportedCategories: rawSupportedCategories, column } = props;

  const sortValues = React.useCallback(
    (values: string[]) => {
      if (!column) return values;
      if (column.type === SchemaColumnTypeEnum.Temporal) {
        return values
          .map(
            (category) => [dayjs(category), category] as [dayjs.Dayjs, string],
          )
          .filter((x) => x[0].isValid())
          .sort((a, b) => a[0].diff(b[0]))
          .map((x) => x[1]);
      } else if (column.type === SchemaColumnTypeEnum.Boolean) {
        return values.slice().sort().reverse();
      } else if (column.type === SchemaColumnTypeEnum.OrderedCategorical) {
        if (!column.category_order) {
          return values.slice().sort();
        }
        return values
          .map(
            (category) =>
              [category, column.category_order!.indexOf(category)] as [
                string,
                number,
              ],
          )
          .map((x) => (x[1] === -1 ? ([x[0], 0] as [string, number]) : x))
          .sort((a, b) => a[1] - b[1])
          .map((x) => x[0]);
      } else {
        return values;
      }
    },
    [column],
  );

  const supportedCategories = React.useMemo(
    () => sortValues(rawSupportedCategories),
    [rawSupportedCategories, sortValues],
  );
  const [categories, setCategories] = React.useState<string[]>(() =>
    sortValues(supportedCategories),
  );

  const onChange = React.useCallback(
    (values: string[]) => {
      setCategories(sortValues(values));
    },
    [sortValues],
  );

  const inputContainer = useMultiSelectSelectAllCheckbox({
    value: categories,
    onChange,
    data: supportedCategories,
    accessor: identity,
  });

  const multiSelectProps = {
    value: categories,
    inputContainer,
    onChange,
    data: supportedCategories.map((category) => {
      if (column?.type === SchemaColumnTypeEnum.Temporal) {
        const label = formatTemporalValueByPrecision(
          new Date(category),
          column.temporal_precision as TemporalPrecisionEnum | null,
        );
        if (!label) return category;
        return {
          label,
          value: category,
        };
      }
      return category;
    }),
    searchable: true,
  };

  const [debouncedCategories] = useDebouncedValue(categories, 1000, {
    leading: false,
  });

  const indexed = React.useCallback(
    (categories: string[]) => {
      const indexMap = fromPairs(
        debouncedCategories.map((category, index) => [category, index]),
      );
      return categories
        .map((category, index) => [category, index] as const)
        .filter((item) =>
          Object.prototype.hasOwnProperty.call(indexMap, item[0]),
        )
        .sort((a, b) => (indexMap[a[0]] ?? 0) - (indexMap[b[0]] ?? 0))
        .map((item) => item[1]);
    },
    [debouncedCategories],
  );

  return {
    multiSelectProps,
    indexed,
    categories: debouncedCategories,
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

  const needsPercentage = mode === CategoricalDataFrequencyMode.Proportion;

  return {
    plotlyLayoutProps,
    transformFrequencies,
    selectProps,
    needsPercentage: needsPercentage,
    character: needsPercentage ? '%' : '',
  };
}

export function useCategoriesAxisMultiSelectForFrequencyDistribution(
  props: BaseVisualizationComponentProps<
    VisualizationFrequencyDistributionModel,
    object
  >,
) {
  const { data, item } = props;
  const column = useProjectColumn(item.column);
  const allCategories = React.useMemo(
    () => uniq(data.flatMap((subdataset) => subdataset.data.categories)),
    [data],
  );
  const { indexed, multiSelectProps, categories } =
    useCategoriesAxisMultiSelect({
      column,
      supportedCategories: allCategories,
    });

  return {
    multiSelectProps,
    categories: categories,
    indexed,
  };
}
