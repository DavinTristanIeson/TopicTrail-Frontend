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
    const scatterPlots: PlotParams['data'] = data.map((item, index) => {
      return {
        name: item.name,
        x: item.data.x as number[],
        y: item.data.y as number[],
        type: 'scattergl',
        marker: {
          color: colors[index],
          size: item.data.frequencies,
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
