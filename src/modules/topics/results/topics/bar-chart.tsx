import { getTopicLabel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { merge, zip } from 'lodash';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { extractTopicCustomdataForPlotly } from './utils';
import { Alert, Anchor, Input, Select, Slider, Stack } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import { useCategoricalDataFrequencyMode } from '@/modules/visualization/components/categorical/utils';
import { useDebouncedState } from '@mantine/hooks';
import { TopicVisualizationRendererProps } from './data-providers';

export function TopicWordsBarChartRenderer(
  props: TopicVisualizationRendererProps,
) {
  const { data, column } = props;
  const [topNWords, setTopNWords] = useDebouncedState(5, 500);
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
        hovertemplate: `<b>Topic</b>: %{y}<br><b>Significance</b>: %{x}<br>`,
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
      <Input.Wrapper
        label="Show top N words"
        description="This value determines how many words are shown at once in this plot. Please note that having too many words on screen may make it harder for you to understand the topics. Usually 5 - 10 keywords are enough to represent the meaning of a topic."
      >
        <Slider
          min={3}
          max={50}
          defaultValue={topNWords}
          onChange={setTopNWords}
          step={1}
          maw={512}
          label={`Show top ${topNWords} Words`}
        />
      </Input.Wrapper>

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

export function TopicBarChartRenderer(props: TopicVisualizationRendererProps) {
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
        ...merge(plotlyLayoutProps, {
          xaxis: {
            minallowed: 0,
          },
        }),
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
