import { getTopicLabel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { zip } from 'lodash-es';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import { extractTopicCustomdataForPlotly } from './utils';
import { Alert, Anchor, Select, Stack } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import { TopicVisualizationRendererProps } from './data-providers';
import { useCategoricalDataFrequencyModeState } from '@/modules/visualization/components/configuration';
import { useTopNWordsSlider } from '@/modules/visualization/components/textual/renderer';

export function TopicWordsBarChartRenderer(
  props: TopicVisualizationRendererProps,
) {
  const { data, column } = props;
  const { topNWords, Component: TopNWordsSlider } = useTopNWordsSlider();
  const plot: PlotParams = React.useMemo(() => {
    const subplots: PlotParams['data'] = [];
    const topics = data.map((item) => item.topic);
    const { colors } = generateColorsFromSequence(
      topics.map((topic) => topic.id),
    );
    const maxX = data.reduce((acc, cur) => {
      return Math.max(
        acc,
        cur.topic.words.reduce((acc, cur) => {
          return Math.max(acc, cur[1]);
        }, 0),
      );
    }, 0);
    const layouts: any = {};
    for (let i = 0; i < topics.length; i++) {
      const color = colors[i];
      const topic = topics[i]!;
      const topicWords = topic.words.slice(0, topNWords);
      const y = topicWords.map((word) => word[0]);
      const x = topicWords.map((word) => word[1]);
      y.reverse();
      x.reverse();
      subplots.push({
        x,
        y,
        name: getTopicLabel(topic),
        type: 'bar',
        orientation: 'h',
        hovertemplate: `<b>Word</b>: %{y}<br><b>C-TF-IDF</b>: %{x}<br>`,
        xaxis: `x${i + 1}`,
        yaxis: `y${i + 1}`,
        marker: {
          color,
        },
      });
      layouts[i === 0 ? 'xaxis' : `xaxis${i + 1}`] = {
        minallowed: 0,
        title: getTopicLabel(topic),
        range: [0, maxX],
      };
    }
    const rows = Math.ceil(subplots.length / 3);
    return {
      data: subplots,
      layout: {
        title: {
          text: `Topic Words of "${column.name}"`,
        },
        height: 400 * rows,
        grid: {
          rows,
          columns: 3,
          pattern: 'independent',
        },
        ...layouts,
      },
    };
  }, [column.name, data, topNWords]);
  return (
    <Stack>
      {TopNWordsSlider}
      <Alert color="blue" icon={<Info />}>
        The &quot;significance&quot; in question is the c-TF-IDF score of each
        word. This score represents how much this word uniquely identifies this
        topic (as in, it can only be found in this topic). For more information,
        you can view the explanation of c-TF-IDF in this{' '}
        <Anchor
          href="https://maartengr.github.io/BERTopic/getting_started/ctfidf/ctfidf.html"
          inherit
        >
          page
        </Anchor>
        .
      </Alert>
      <PlotRenderer plot={plot} scrollZoom={false} />
    </Stack>
  );
}

export function TopicBarChartRenderer(props: TopicVisualizationRendererProps) {
  const { data, column } = props;
  const {
    plotlyLayoutProps,
    selectProps,
    transformFrequencies,
    needsPercentage,
  } = useCategoricalDataFrequencyModeState();
  const plot: PlotParams = React.useMemo(() => {
    const topics = data.map((item) => item.topic);
    const y = topics.map((topic) => getTopicLabel(topic));
    const x = transformFrequencies(data.map((item) => item.frequency));

    const { customdata: topicsCustomdata, hovertemplate: topicsHovertemplate } =
      extractTopicCustomdataForPlotly({
        topics,
        percentage: needsPercentage,
      });
    const customdata = zip(...topicsCustomdata) as string[][];
    const { colors } = generateColorsFromSequence(
      data.map((item) => item.topic.id),
    );
    return {
      data: [
        {
          x,
          y,
          hovertemplate: topicsHovertemplate,
          customdata: customdata,
          type: 'bar',
          orientation: 'h',
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        xaxis: {
          ...plotlyLayoutProps,
          minallowed: 0,
        },
        height: 720,
        title: {
          text: `Topic Frequencies of "${column.name}"`,
        },
        minallowed: 0,
        yaxis: {
          automargin: true,
        },
      },
    };
  }, [
    column.name,
    data,
    needsPercentage,
    plotlyLayoutProps,
    transformFrequencies,
  ]);
  return (
    <Stack>
      <Select {...selectProps} maw={512} />
      <PlotRenderer plot={plot} />
    </Stack>
  );
}
