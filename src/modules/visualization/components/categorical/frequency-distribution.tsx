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
import { fromPairs, uniq, zip } from 'lodash-es';

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

  const isBarChart =
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.BarChart;
  const isLinePlot =
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.LinePlot;
  const isHeatmap =
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.Heatmap;
  if (!isLinePlot && !isBarChart && !isHeatmap) {
    throw new Error(
      `${item.config.display} is not a valid display mode for frequency distributions.`,
    );
  }

  // region Plot
  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (allCategories.length === 0) return undefined;
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );

    let subplots: PlotParams['data'];
    if (isHeatmap) {
      const allCategories = uniq(
        data.flatMap((entry) => entry.data.categories),
      );
      const mask = indexed(allCategories);
      const x = pickArrayByIndex(allCategories, mask);
      const y = data.map((entry) => entry.name);
      const z = data.map(({ data: { frequencies, categories } }) => {
        const categoryFrequencyMap = fromPairs(
          zip(categories, transformFrequencies(frequencies)),
        );
        const z = categories.map((category) => categoryFrequencyMap[category]);
        return z;
      });

      subplots = [
        {
          x,
          y,
          z,
          type: 'heatmap',
          colorscale: 'Greens',
          hovertemplate: [
            `<b>${item.column}</b>: %{x}`,
            `<b>Subdataset</b>: %{y}`,
            `<b>${needsPercentage ? 'Proportion' : 'Frequency'}</b>: %{z}${needsPercentage ? '%' : ''}`,
          ].join('<br>'),
          zmin: 0,
          zmax: needsPercentage ? 100 : undefined,
        },
      ];
    } else {
      subplots = data.map(
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
            hovertemplate: [
              `<b>${item.column}</b>: %{x}`,
              `<b>${needsPercentage ? 'Proportion' : 'Frequency'}</b>: %{y}`,
            ].join('<br>'),
            marker: {
              color: colors[idx],
            },
          };
        },
      );
    }

    return {
      data: subplots,
      layout: {
        title: {
          text: `Frequency Distribution of ${item.column}`,
          subtitle: {
            text:
              isHeatmap && needsPercentage
                ? 'The values of each row sums up to 100%.'
                : undefined,
          },
        },
        yaxis: isHeatmap
          ? undefined
          : {
              ...plotlyLayoutProps,
            },
        barmode: isBarChart ? 'group' : undefined,
      },
    };
  }, [
    allCategories.length,
    data,
    isHeatmap,
    item.column,
    needsPercentage,
    plotlyLayoutProps,
    isBarChart,
    indexed,
    transformFrequencies,
    isLinePlot,
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
      {plot && (
        <PlotRenderer plot={plot} {...plotProps} scrollZoom={!isHeatmap} />
      )}
    </Stack>
  );
}
