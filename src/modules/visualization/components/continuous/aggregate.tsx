import { VisualizationAggregateValuesModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { VisualizationFrequencyDistributonDisplayMode } from '../../configuration/frequency-distribution';
import { VisualizationAggregateValuesConfigType } from '../../configuration/aggregate-values';

export function VisualizationAggregateValuesBarChart(
  props: BaseVisualizationComponentProps<
    VisualizationAggregateValuesModel,
    VisualizationAggregateValuesConfigType
  >,
) {
  const { data, item } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(
      ({ name, data: { values, categories } }, idx) => {
        return {
          name,
          x: categories,
          y: values,
          type: 'bar',
          marker: {
            color: colors[idx],
          },
        };
      },
    );
    return {
      data: subplots,
      layout: {
        title: `Values of ${item.column} Grouped By ${item.config.grouped_by}`,
        barmode: 'group',
      },
    };
  }, [data, item.column, item.config.grouped_by]);
  return <PlotRenderer plot={plot} />;
}

export function VisualizationAggregateValuesLinePlot(
  props: BaseVisualizationComponentProps<
    VisualizationAggregateValuesModel,
    VisualizationAggregateValuesConfigType
  >,
) {
  const { data, item } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(
      ({ name, data: { values, categories } }, idx) => {
        return {
          name,
          mode: 'lines+markers',
          x: categories,
          y: values,
          type: 'scatter',
          marker: {
            color: colors[idx],
          },
        };
      },
    );
    return {
      data: subplots,
      layout: {
        title: `Values of ${item.column} Grouped By ${item.config.grouped_by}`,
      },
    };
  }, [data, item.column, item.config.grouped_by]);
  return <PlotRenderer plot={plot} />;
}

export function VisualizationAggregateValuesRenderer(
  props: BaseVisualizationComponentProps<
    VisualizationAggregateValuesModel,
    VisualizationAggregateValuesConfigType
  >,
) {
  const { item } = props;
  if (
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.BarChart
  ) {
    return <VisualizationAggregateValuesBarChart {...props} />;
  }
  if (
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.LinePlot
  ) {
    return <VisualizationAggregateValuesLinePlot {...props} />;
  }
  throw Error(
    `${item.config.display} is not a valid display mode for aggregate values.`,
  );
}
