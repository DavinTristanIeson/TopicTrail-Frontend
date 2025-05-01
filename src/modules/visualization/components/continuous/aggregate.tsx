import { VisualizationAggregateValuesModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { capitalize, uniq } from 'lodash-es';
import { VisualizationAggregateValuesConfigType } from '../../configuration/aggregate-values';
import { VisualizationFrequencyDistributonDisplayMode } from '../../configuration/frequency-distribution';
import {
  PlotInlineConfiguration,
  useCategoriesAxisMultiSelect,
  usePlotRendererHelperProps,
} from '../configuration';
import { useProjectColumn } from '@/modules/project/context';
import { pickArrayByIndex } from '@/common/utils/iterable';
import { MultiSelect } from '@mantine/core';

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

  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const isLinePlot =
      item.config.display ===
      VisualizationFrequencyDistributonDisplayMode.LinePlot;
    const isBarChart =
      item.config.display ===
      VisualizationFrequencyDistributonDisplayMode.BarChart;
    const subplots: PlotParams['data'] = data.map(
      ({ name, data: { values, categories } }, idx) => {
        const mask = indexed(categories);
        return {
          name,
          mode: isLinePlot ? 'lines+markers' : undefined,
          x: pickArrayByIndex(categories, mask),
          y: pickArrayByIndex(values, mask),
          type: isLinePlot ? 'scatter' : 'bar',
          hovertemplate: `<b>${capitalize(item.config.method)} of ${item.column}</b>: %{y}<br><b>${item.config.grouped_by}</b>: %{x}`,
          marker: {
            color: colors[idx],
          },
        };
      },
    );
    return {
      data: subplots,
      layout: {
        title: `Values of ${item.column} Grouped By ${item.config.grouped_by} (${capitalize(item.config.method)})`,
        barmode: isBarChart ? 'group' : undefined,
      },
    };
  }, [data, indexed, item]);
  return (
    <>
      <PlotInlineConfiguration>
        <MultiSelect
          {...categoriesMultiSelectProps}
          label={`Values of ${item.config.grouped_by}`}
        />
      </PlotInlineConfiguration>
      <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />
    </>
  );
}
