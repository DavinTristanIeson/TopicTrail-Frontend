import { TableColumnCountsModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { plotlyCalculateGrid } from '../utils';
import { useMantineTheme } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';

export default function ColumnCountsRingChart(
  props: BaseVisualizationComponentProps<TableColumnCountsModel, object>,
) {
  const { data, item } = props;
  const { colors } = useMantineTheme();
  const plot = React.useMemo<PlotParams>(() => {
    return {
      data: data.map(({ name, data: counts }) => {
        const values = [counts.valid, counts.invalid];
        const labels = ['Valid Rows', 'Empty Rows'];
        const markerColors = [colors.green[6], colors.red[6]];
        if (counts.outlier != null) {
          values.push(counts.outlier!);
          labels.push('Outliers');
          markerColors.push(colors.gray[6]);
        }
        return {
          type: 'pie',
          name,
          values,
          labels,
          marker: {
            colors: markerColors,
          },
          hoverinfo: 'label+percent+name',
          textinfo: 'label',
        };
      }),
      layout: {
        grid: {
          ...plotlyCalculateGrid(item.rect.width, data.length),
          pattern: 'independent',
        },
      },
    };
  }, [colors.gray, colors.green, colors.red, data, item.rect.width]);
  return <PlotRenderer plot={plot} />;
}
