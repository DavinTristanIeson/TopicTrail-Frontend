import { VisualizationColumnCountsModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { usePlotRendererHelperProps } from '../utils';
import { useMantineTheme } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';

export default function VisualizationColumnCountsRingChart(
  props: BaseVisualizationComponentProps<
    VisualizationColumnCountsModel,
    object
  >,
) {
  const { data, item } = props;
  const { colors } = useMantineTheme();
  const plot = React.useMemo<PlotParams>(() => {
    const columnCount = 3;
    const subplots: PlotParams['data'] = [];
    for (let index = 0; index < data.length; index++) {
      const name = data[index]!.name;
      const counts = data[index]!.data;
      const values = [counts.valid, counts.invalid, counts.outside];
      const labels = ['Valid Rows', 'Empty Rows', 'Outside Rows'];
      const markerColors = [colors.green[6], colors.red[6], colors.gray[6]];
      if (counts.outlier != null) {
        values.push(counts.outlier!);
        labels.push('Outliers');
        markerColors.push(colors.orange[6]);
      }
      subplots.push({
        type: 'pie',
        title: {
          position: 'top center',
          font: {
            size: 20,
          },
          text: name,
        },
        name,
        values,
        labels,
        marker: {
          colors: markerColors,
        },
        domain: {
          column: index % columnCount,
          row: Math.floor(index / columnCount),
        },
        hoverinfo: 'label+value+percent',
        textinfo: 'label+value+percent',
        textposition: 'inside',
        insidetextorientation: 'radial',
      });
    }
    return {
      data: subplots,
      layout: {
        margin: {
          t: 0,
          b: 0,
          l: 0,
          r: 0,
        },
        grid: {
          rows: Math.ceil(data.length / columnCount),
          columns: columnCount,
        },
      },
    };
  }, [colors.gray, colors.green, colors.orange, colors.red, data]);
  console.log(plot);
  return <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />;
}
