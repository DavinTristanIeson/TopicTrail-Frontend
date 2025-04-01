import { TextualSchemaColumnModel } from '@/api/project';
import { DocumentTopicsVisualizationModel, getTopicLabel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer, { plotlyWrapText } from '@/components/widgets/plotly';
import { zip } from 'lodash';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { useTopicModelingResultOfColumn } from '../../components/context';
import { useMantineTheme } from '@mantine/core';

interface TopicVisualizationBubbleChartRendererProps {
  data: DocumentTopicsVisualizationModel;
  column: TextualSchemaColumnModel;
}

export function TopicVisualizationScatterPlotRenderer(
  props: TopicVisualizationBubbleChartRendererProps,
) {
  const { data, column } = props;
  const topicModelingResult = useTopicModelingResultOfColumn(column.name)!;
  const { colors: mantineColors } = useMantineTheme();
  const plot: PlotParams = React.useMemo(() => {
    const x = data.documents.map((item) => item.x);
    const y = data.documents.map((item) => item.y);
    const documentTopicAssignments = data.documents.map((item) => item.topic);
    const actualTopicMap = new Map(
      topicModelingResult.result!.topics.map((topic) => [topic.id, topic]),
    );

    const documentContents = data.documents.map((item) =>
      plotlyWrapText(item.document),
    );
    const topicLabels = documentTopicAssignments.map((topic) => {
      if (topic === -1) return 'Outlier';
      return getTopicLabel(actualTopicMap.get(topic)!);
    });
    const topicDescriptions = documentTopicAssignments.map((topic) => {
      return plotlyWrapText(actualTopicMap.get(topic)?.description ?? '');
    });
    const topicTags = documentTopicAssignments.map((topic) => {
      return plotlyWrapText(actualTopicMap.get(topic)?.tags?.join(', ') ?? '');
    });

    const customdata = zip(
      documentContents,
      topicLabels,
      topicDescriptions,
      topicTags,
    );
    const { colors } = generateColorsFromSequence(documentTopicAssignments, {
      partialColorMap: new Map([[-1, mantineColors.gray[4]]]),
    });
    return {
      data: [
        {
          x,
          y,
          mode: 'markers',
          hovertemplate: `<b>Content</b>: %{customdata[0]}<br><b>Topic</b>: %{customdata[1]}<br><b>Topic Description</b>: %{customdata[2]}<br><b>Topic Tags</b>: %{customdata[3]}<br>`,
          customdata,
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: {
          text: `Documents of "${column.name}"`,
        },
      },
    };
  }, [
    column.name,
    data.documents,
    mantineColors.gray,
    topicModelingResult.result,
  ]);
  return <PlotRenderer plot={plot} />;
}
