import { TextualSchemaColumnModel } from '@/api/project';
import { getTopicLabel, TopicVisualizationModel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { zip } from 'lodash';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { extractTopicCustomdataForPlotly } from './utils';
import { Alert, Anchor, Select, Stack } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import { useCategoricalDataFrequencyMode } from '@/modules/visualization/categorical/utils';

interface TopicVisualizationBarChartRendererProps {
  data: TopicVisualizationModel[];
  column: TextualSchemaColumnModel;
}

export function TopicWordsBarChartRenderer(
  props: TopicVisualizationBarChartRendererProps,
) {
  const { data, column } = props;
  const [topNWords, setTopNWords] = React.useState(5);
  const plot: PlotParams = React.useMemo(() => {
    const subplots: PlotParams['data'] = [];
    const topics = data.map((item) => item.topic);
    const { colors } = generateColorsFromSequence(
      topics.map((topic) => topic.id),
    );
    for (let i = 0; i < topics.length; i++) {
      const color = colors[i];
      const topic = topics[i]!;
      const topicWords = topic.words.slice(0, topNWords);
      const y = topicWords.map((word) => word[0]);
      const x = topicWords.map((word) => word[1]);
      subplots.push({
        x,
        y,
        name: getTopicLabel(topic),
        type: 'bar',
        orientation: 'h',
        hovertemplate: `<b>Topic</b>: %{y}<br><b>Significance</b>: %{x}<br>`,
        // domain: {
        //   row: Math.floor(i / 3),
        //   column: i % 3,
        // },
        marker: {
          color,
        },
      });
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
      },
    };
  }, [column.name, data, topNWords]);
  return (
    <Stack>
      <Select
        label="Show top N words"
        required
        allowDeselect={false}
        value={topNWords.toString()}
        onChange={(e) => {
          if (!e) return;
          setTopNWords(parseInt(e));
        }}
        data={[5, 10, 15, 20, 25, 50].map((x) => {
          return {
            label: `Top ${x} words`,
            value: x.toString(),
          };
        })}
      />
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
      <PlotRenderer plot={plot} />
    </Stack>
  );
}

export function TopicBarChartRenderer(
  props: TopicVisualizationBarChartRendererProps,
) {
  const { data, column } = props;
  const {
    plotlyLayoutProps,
    selectProps,
    transformFrequencies,
    needsPercentage,
  } = useCategoricalDataFrequencyMode();
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
        ...plotlyLayoutProps,
        title: {
          text: `Topics of "${column.name}"`,
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
      <Select {...selectProps} />
      <PlotRenderer plot={plot} />
    </Stack>
  );
}
