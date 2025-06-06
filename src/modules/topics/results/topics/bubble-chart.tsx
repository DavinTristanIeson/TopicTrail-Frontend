import { getTopicLabel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { zip } from 'lodash-es';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import { extractTopicCustomdataForPlotly } from './utils';
import { SemanticTopicVisualizationRendererProps } from './data-providers';

export function useTopicVisualizationPlotlyData(
  props: SemanticTopicVisualizationRendererProps,
) {
  const { data } = props;
  const plot: PlotParams['data'] = React.useMemo(() => {
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
    return [
      {
        name: 'Topics',
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
    ];
  }, [data]);

  return plot;
}

export function TopicVisualizationBubbleChartRenderer(
  props: SemanticTopicVisualizationRendererProps,
) {
  const { column } = props;
  const plotData = useTopicVisualizationPlotlyData(props);
  const plot: PlotParams = React.useMemo(() => {
    return {
      data: plotData,
      layout: {
        title: {
          text: `Topics of "${column.name}"`,
        },
        height: 720,
        xaxis: {
          title: 'D1',
        },
        yaxis: {
          title: 'D2',
        },
      },
    } as PlotParams;
  }, [column.name, plotData]);
  return <PlotRenderer plot={plot} />;
}
