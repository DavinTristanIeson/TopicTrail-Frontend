import { TextualSchemaColumnModel } from '@/api/project';
import { getTopicLabel, TopicVisualizationModel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer, { plotlyWrapText } from '@/components/widgets/plotly';
import { zip } from 'lodash';
import React from 'react';
import { PlotParams } from 'react-plotly.js';

interface TopicVisualizationBubbleChartRendererProps {
  data: TopicVisualizationModel[];
  column: TextualSchemaColumnModel;
}

export function TopicVisualizationBubbleChartRenderer(
  props: TopicVisualizationBubbleChartRendererProps,
) {
  const { data, column } = props;
  const plot: PlotParams = React.useMemo(() => {
    const x = data.map((item) => item.x);
    const y = data.map((item) => item.y);
    const labels = data.map((item) => getTopicLabel(item.topic));
    const topicWords = data.map((item) =>
      plotlyWrapText(
        item.topic.words
          .slice(0, 20)
          .map((word) => `(${word[0]}, ${word[1].toFixed(2)})`)
          .join(', '),
      ),
    );
    const topicDescriptions = data.map((item) =>
      plotlyWrapText(item.topic.description ?? ''),
    );
    const topicTags = data.map((item) =>
      plotlyWrapText(item.topic.tags?.join(', ') ?? ''),
    );
    const sizes = data.map((item) => item.frequency);

    const customdata = zip(
      labels,
      topicWords,
      sizes,
      topicDescriptions,
      topicTags,
    );
    const { colors } = generateColorsFromSequence(
      data.map((item) => item.topic.id),
    );
    return {
      data: [
        {
          x,
          y,
          mode: 'markers+text',
          hovertemplate: `<b>Topic</b>: %{customdata[0]}<br><b>Words</b>: %{customdata[1]}<br><b>Frequency</b>: %{customdata[2]}<br><b>Description</b>: %{customdata[3]}<br><b>Tags</b>: %{customdata[4]}<br>`,
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
      },
    };
  }, [column.name, data]);
  return <PlotRenderer plot={plot} />;
}
