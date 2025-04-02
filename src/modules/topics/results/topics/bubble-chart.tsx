import { getTopicLabel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { zip } from 'lodash';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { extractTopicCustomdataForPlotly } from './utils';
import { TopicVisualizationRendererProps } from './data-providers';

export function TopicVisualizationBubbleChartRenderer(
  props: TopicVisualizationRendererProps,
) {
  const { data, column } = props;
  const plot: PlotParams = React.useMemo(() => {
    const x = data.map((item) => item.x);
    const y = data.map((item) => item.y);
    const labels = data.map((item) => getTopicLabel(item.topic));
    const { customdata: topicsCustomdata, hovertemplate: topicsHovertemplate } =
      extractTopicCustomdataForPlotly({
        topics: data.map((item) => item.topic),
      });
    const sizes = data.map((item) => item.frequency);
    const customdata = zip(...topicsCustomdata) as string[][];
    const { colors } = generateColorsFromSequence(
      data.map((item) => item.topic.id),
    );
    return {
      data: [
        {
          x,
          y,
          mode: 'markers+text',
          hovertemplate: topicsHovertemplate,
          text: labels,
          textposition: 'bottom center',
          customdata,
          marker: {
            color: colors,
            size: sizes as any,
          },
        },
      ],
      layout: {
        title: {
          text: `Topics of "${column.name}"`,
        },
        height: 720,
      },
    };
  }, [column.name, data]);
  return <PlotRenderer plot={plot} />;
}
