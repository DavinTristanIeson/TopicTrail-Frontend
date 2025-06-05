import { VisualizationAggregateValuesModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { capitalize, fromPairs, uniq, zip } from 'lodash-es';
import {
  VISUALIZATION_AGGREGATION_METHOD_DICTIONARY,
  VisualizationAggregateValuesConfigType,
} from '../../configuration/aggregate-values';
import { VisualizationFrequencyDistributonDisplayMode } from '../../configuration/frequency-distribution';
import {
  PlotInlineConfiguration,
  useCategoriesAxisMultiSelect,
  usePlotRendererHelperProps,
} from '../configuration';
import { useProjectColumn } from '@/modules/project/context';
import { pickArrayByIndex } from '@/common/utils/iterable';
import { MultiSelect } from '@mantine/core';
import { getBalancedHeatmapZRange } from '../configuration/heatmap';

export function VisualizationAggregateValuesRenderer(
  props: BaseVisualizationComponentProps<
    VisualizationAggregateValuesModel,
    VisualizationAggregateValuesConfigType
  >,
) {
  const { data, item } = props;
  const column = useProjectColumn(item.column);
  const allCategories = React.useMemo(
    () => uniq(data.flatMap((subdataset) => subdataset.data.categories)),
    [data],
  );
  const { indexed, multiSelectProps: categoriesMultiSelectProps } =
    useCategoriesAxisMultiSelect({
      column,
      supportedCategories: allCategories,
    });

  const isLinePlot =
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.LinePlot;
  const isBarChart =
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.BarChart;
  const isHeatmap =
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.Heatmap;
  if (!isLinePlot && !isBarChart && !isHeatmap) {
    throw new Error(
      `${item.config.display} is not a valid display mode for aggregate values.`,
    );
  }
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );

    const aggregationMethod =
      VISUALIZATION_AGGREGATION_METHOD_DICTIONARY[item.config.method].label;
    const title = `Values of ${item.column} Grouped By ${item.config.grouped_by} (${aggregationMethod})`;
    if (isHeatmap) {
      const allCategories = uniq(
        data.flatMap((entry) => entry.data.categories),
      );
      const mask = indexed(allCategories);
      const x = pickArrayByIndex(allCategories, mask);
      const y = data.map((entry) => entry.name);
      const z = data.map(({ data: { values, categories } }) => {
        const categoryFrequencyMap = fromPairs(zip(categories, values));
        const z = x.map((category) => categoryFrequencyMap[category]);
        return z;
      });

      const [minZ, maxZ] = getBalancedHeatmapZRange(z);
      const valueLabel = `${aggregationMethod} of ${item.column}`;
      return {
        data: [
          {
            x,
            y,
            z,
            type: 'heatmap',
            hoverongaps: false,
            hovertemplate: [
              `<b>${item.config.grouped_by}</b>: %{x}`,
              `<b>Subdataset</b>: %{y}`,
              `<b>${valueLabel}</b>: %{z}`,
            ].join('<br>'),
            texttemplate: '%{z:.3f}',
            zmin: minZ,
            zmax: maxZ,
            colorbar: {
              title: valueLabel,
            },
          },
        ],
        layout: {
          title,
          xaxis: {
            title: item.config.grouped_by,
          },
          yaxis: {
            title: 'Subdatasets',
            type: 'category',
            autorange: 'reversed',
          },
        },
      } as PlotParams;
    } else {
      return {
        data: data.map(({ name, data: { values, categories } }, idx) => {
          const mask = indexed(categories);
          return {
            name,
            mode: isLinePlot ? 'lines+markers' : undefined,
            x: pickArrayByIndex(categories, mask),
            y: pickArrayByIndex(values, mask),
            type: isLinePlot ? 'scattergl' : 'bar',
            hovertemplate: [
              `<b>${item.config.grouped_by}</b>: %{x}`,
              `<b>${capitalize(item.config.method)} of ${item.column}</b>: %{y}`,
            ].join('<br>'),
            marker: {
              color: colors[idx],
            },
          };
        }),
        layout: {
          title,
          barmode: isBarChart ? 'group' : undefined,
          xaxis: {
            title: item.config.grouped_by,
          },
          yaxis: {
            title: `${aggregationMethod} of ${item.column}`,
          },
        },
      } as PlotParams;
    }
  }, [
    data,
    indexed,
    isBarChart,
    isHeatmap,
    isLinePlot,
    item.column,
    item.config.grouped_by,
    item.config.method,
  ]);
  return (
    <>
      <PlotInlineConfiguration>
        <MultiSelect
          {...categoriesMultiSelectProps}
          label={`Values of ${item.config.grouped_by}`}
        />
      </PlotInlineConfiguration>
      <PlotRenderer
        plot={plot}
        {...usePlotRendererHelperProps(item)}
        scrollZoom={!isHeatmap}
      />
    </>
  );
}
