import { VisualizationFrequencyDistributionModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import {
  VisualizationFrequencyDistributionConfigType,
  VisualizationFrequencyDistributonDisplayMode,
} from '../../configuration/frequency-distribution';
import { MultiSelect, Select, Stack } from '@mantine/core';
import {
  PlotInlineConfiguration,
  usePlotRendererHelperProps,
  useCategoricalDataFrequencyModeState,
  useCategoriesAxisMultiSelectForFrequencyDistribution,
} from '../configuration';
import { pickArrayByIndex } from '@/common/utils/iterable';

function getHoverTemplate(column: string, needsPercentage: boolean) {
  return `<b>${column}</b>: %{x}<br><b>${needsPercentage ? 'Proportion' : 'Frequency'}</b>: %{y}`;
}

export default function VisualizationFrequencyDistributionComponent(
  props: BaseVisualizationComponentProps<
    VisualizationFrequencyDistributionModel,
    VisualizationFrequencyDistributionConfigType
  >,
) {
  const { data, item } = props;

  // region Configuration
  const {
    transformFrequencies,
    plotlyLayoutProps,
    selectProps: frequencyModeSelectProps,
    needsPercentage,
  } = useCategoricalDataFrequencyModeState();

  const {
    indexed,
    categories: allCategories,
    multiSelectProps: categoriesMultiSelectProps,
  } = useCategoriesAxisMultiSelectForFrequencyDistribution(props);

  // region Plot
  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (allCategories.length === 0) return undefined;
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );

    const isBarChart =
      item.config.display ===
      VisualizationFrequencyDistributonDisplayMode.BarChart;
    const isLinePlot =
      item.config.display ===
      VisualizationFrequencyDistributonDisplayMode.LinePlot;

    const subplots: PlotParams['data'] = data.map(
      ({ name, data: { frequencies, categories } }, idx) => {
        const mask = indexed(categories);
        const x = pickArrayByIndex(categories, mask);
        const y = pickArrayByIndex(transformFrequencies(frequencies), mask);
        return {
          name,
          mode: 'lines+markers',
          x: x,
          y: y,
          type: isLinePlot ? 'scatter' : 'bar',
          hovertemplate: getHoverTemplate(item.column, needsPercentage),
          marker: {
            color: colors[idx],
          },
        };
      },
    );
    return {
      data: subplots,
      layout: {
        title: `Frequency Distribution of ${item.column}`,
        yaxis: {
          ...plotlyLayoutProps,
        },
        barmode: isBarChart ? 'group' : undefined,
      },
    };
  }, [
    allCategories.length,
    data,
    item,
    indexed,
    needsPercentage,
    plotlyLayoutProps,
    transformFrequencies,
  ]);

  const plotProps = usePlotRendererHelperProps(item);
  return (
    <Stack>
      <PlotInlineConfiguration>
        <Select {...frequencyModeSelectProps} />
        <MultiSelect
          label={`Values of ${item.column}`}
          {...categoriesMultiSelectProps}
        />
      </PlotInlineConfiguration>
      {plot && <PlotRenderer plot={plot} {...plotProps} />}
    </Stack>
  );
}
