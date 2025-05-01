import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { groupBy, zip } from 'lodash-es';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import { useTopicModelingResultOfColumn } from '../../components/context';
import { useMantineTheme } from '@mantine/core';
import { DocumentTopicsVisualizationRendererProps } from './data-providers';
import { plotlyWrapText } from '@/modules/visualization/components/utils';
import { getTopicLabel } from '@/api/topic';

export function TopicVisualizationScatterPlotRenderer(
  props: DocumentTopicsVisualizationRendererProps,
) {
  const { data, column } = props;
  const topicModelingResult = useTopicModelingResultOfColumn(column.name)!;
  const { colors: mantineColors } = useMantineTheme();
  const plot: PlotParams = React.useMemo(() => {
    const groups = Object.values(groupBy(data.documents, (item) => item.topic));
    const subplots: PlotParams['data'] = [];
    const { colors } = generateColorsFromSequence(groups);
    for (const [group, color] of zip(groups, colors)) {
      if (!group) continue;
      const x = group.map((item) => item.x);
      const y = group.map((item) => item.y);
      const topicOfThisGroup = group[0]?.topic;
      const plotColor =
        topicOfThisGroup === -1 ? mantineColors.gray[4] : color!;
      const documentContents = data.documents.map((item) =>
        plotlyWrapText(item.document),
      );
      const topic = topicModelingResult.result?.topics.find(
        (topic) => topic.id === topicOfThisGroup,
      );

      let hovertemplate: string = '';
      if (topicOfThisGroup === -1) {
        hovertemplate = `This document is not assigned to any topic (Outlier).<b>Frequency</b>: ${group.length}`;
      } else if (topic) {
        hovertemplate = [
          `<b>Topic</b>: ${getTopicLabel(topic)}`,
          `<b>Frequency</b>: ${group.length}`,
          `<b>Tags</b>: ${topic.tags?.join(', ') ?? ''}`,
          `<b>Description</b>: ${topic.description ?? ''}`,
        ].join('<br>');
      }

      subplots.push({
        name:
          topicOfThisGroup === -1
            ? 'Outlier'
            : topic
              ? getTopicLabel(topic)
              : undefined,
        x,
        y,
        type: 'scattergl',
        mode: 'markers',
        hovertemplate: `<b>Content</b>: %{customdata}<br>${hovertemplate}`,
        customdata: documentContents,
        marker: {
          color: plotColor,
        },
      });
    }

    return {
      data: subplots,
      layout: {
        title: {
          text: `Documents of "${column.name}"`,
        },
        height: 720,
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
