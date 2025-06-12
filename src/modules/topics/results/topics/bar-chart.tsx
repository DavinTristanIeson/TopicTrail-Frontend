import { getTopicLabel } from '@/api/topic';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { zip } from 'lodash-es';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import { extractTopicCustomdataForPlotly } from './utils';
import {
  Alert,
  Anchor,
  Select,
  Stack,
  Switch,
  useMantineTheme,
} from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import { TopicVisualizationRendererProps } from './data-providers';
import { useCategoricalDataFrequencyModeState } from '@/modules/visualization/components/configuration';
import { useTopNWordsSlider } from '@/modules/visualization/components/textual/renderer';
import { useDisclosure } from '@mantine/hooks';

export function TopicWordsBarChartRenderer(
  props: TopicVisualizationRendererProps,
) {
  const { data: topics, column } = props;
  const { topNWords, Component: TopNWordsSlider } = useTopNWordsSlider();
  const plot: PlotParams = React.useMemo(() => {
    const subplots: PlotParams['data'] = [];
    const { colors } = generateColorsFromSequence(
      topics.map((topic) => topic.id),
    );
    const maxX = Math.min(
      2,
      topics.reduce((acc, cur) => {
        return Math.max(
          acc,
          cur.words.reduce((acc, cur) => {
            return Math.max(acc, cur[1]);
          }, 0),
        );
      }, 0),
    );
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
  }, [column.name, topics, topNWords]);
  return (
    <Stack className="w-full">
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
  const { data: topics, column, outlierCount } = props;
  const {
    plotlyLayoutProps,
    selectProps,
    transformFrequencies,
    needsPercentage,
  } = useCategoricalDataFrequencyModeState();
  const [includeOutlier, { toggle: toggleOutlier }] = useDisclosure(false);
  const { colors: mantineColors } = useMantineTheme();

  const plot: PlotParams = React.useMemo(() => {
    const y = topics.map((topic) => getTopicLabel(topic));
    const topicFrequencies = topics.map((topic) => topic.frequency);
    let x: number[];
    let outlierX: number | undefined;
    if (includeOutlier && outlierCount != null) {
      topicFrequencies.push(outlierCount);
      const transformedFrequencies = transformFrequencies(topicFrequencies);
      x = transformedFrequencies.slice(0, transformedFrequencies.length - 1);
      outlierX = transformedFrequencies[transformedFrequencies.length - 1];
    } else {
      x = transformFrequencies(topicFrequencies);
      outlierX = undefined;
    }

    const { customdata: topicsCustomdata, hovertemplate: topicsHovertemplate } =
      extractTopicCustomdataForPlotly({
        topics,
        percentage: needsPercentage,
      });
    const customdata = zip(...topicsCustomdata) as string[][];
    const { colors } = generateColorsFromSequence(
      topics.map((topic) => topic.id),
    );

    const traces: PlotParams['data'] = [
      {
        x,
        y,
        hovertemplate: topicsHovertemplate,
        customdata: customdata,
        type: 'bar',
        orientation: 'h',
        showlegend: false,
        marker: {
          color: colors,
        },
      },
    ];
    if (outlierX != null) {
      traces.push({
        x: [outlierX],
        y: ['Outlier'],
        type: 'bar',
        showlegend: false,
        orientation: 'h',
        hovertemplate: '<b>Outlier</b><br><b>Frequency</b>: %{x}',
        marker: {
          color: mantineColors.gray[3],
        },
      });
    }
    return {
      data: traces,
      layout: {
        xaxis: {
          ...plotlyLayoutProps,
          minallowed: 0,
          title: needsPercentage ? 'Proportion (%)' : 'Frequency',
        },
        height: 720,
        title: {
          text: `Topic Frequencies of "${column.name}"`,
        },
        minallowed: 0,
        yaxis: {
          title: 'Topics',
          automargin: true,
          autorange: 'reversed',
        },
      },
    } as PlotParams;
  }, [
    column.name,
    includeOutlier,
    mantineColors.gray,
    needsPercentage,
    outlierCount,
    plotlyLayoutProps,
    topics,
    transformFrequencies,
  ]);
  return (
    <Stack>
      <Select {...selectProps} maw={512} />
      <Switch label="Include outlier?" onClick={toggleOutlier} />
      <PlotRenderer plot={plot} />
    </Stack>
  );
}
