import { VisualizationPairedValuesModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationPairedValuesConfigType } from '../../configuration/paired-values';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';

export default function VisualizationPairedValuesComponent(
  props: BaseVisualizationComponentProps<
    VisualizationPairedValuesModel,
    VisualizationPairedValuesConfigType
  >,
) {
  const { data, item } = props;

  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const scatterPlots: PlotParams['data'] = data.map((scatterData, index) => {
      return {
        name: scatterData.name,
        x: scatterData.data.x as number[],
        y: scatterData.data.y as number[],
        type: 'scattergl',
        mode: 'markers',
        customdata: scatterData.data.frequencies,
        hovertemplate: [
          `<b>${item.column}</b>: %{y}`,
          `<b>${item.config.column2}</b>: %{x}`,
          `<b>Frequency</b>: %{customdata}`,
        ].join('<br>'),
        marker: {
          color: colors[index],
          size: scatterData.data.frequencies,
        },
      };
    });
    return {
      data: scatterPlots,
      layout: {
        xaxis: {
          title: item.config.column2,
        },
        yaxis: {
          title: item.column,
        },
      } as PlotParams['layout'],
    };
  }, [data, item.column, item.config.column2]);

  return <PlotRenderer plot={plot} />;
}
