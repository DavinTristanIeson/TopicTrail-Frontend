import { TextualSchemaColumnModel } from '@/api/project';
import { DocumentTopicsVisualizationModel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer, { plotlyWrapText } from '@/components/widgets/plotly';
import { zip } from 'lodash';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { useTopicModelingResultOfColumn } from '../../components/context';
import { useMantineTheme } from '@mantine/core';
import { extractTopicCustomdataForPlotly } from './utils';

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

    const topicsMapping = documentTopicAssignments.map(
      (topic) => actualTopicMap.get(topic) ?? null,
    );
    const { customdata: topicsCustomdata, hovertemplate: topicsHovertemplate } =
      extractTopicCustomdataForPlotly({
        topics: topicsMapping,
        startIndex: 1,
        toggles: {
          words: false,
        },
      });

    const customdata = zip(documentContents, ...topicsCustomdata) as string[][];
    const { colors } = generateColorsFromSequence(documentTopicAssignments, {
      partialColorMap: new Map([[-1, mantineColors.gray[4]]]),
    });
    return {
      data: [
        {
          x,
          y,
          mode: 'markers',
          hovertemplate: `<b>Content</b>: %{customdata[0]}<br>${topicsHovertemplate}`,
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
