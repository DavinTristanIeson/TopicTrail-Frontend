import { generateColorsFromSequence } from '@/common/utils/colors';
import { Alert, Input, Slider, Title } from '@mantine/core';
import { XCircle } from '@phosphor-icons/react';
import chroma from 'chroma-js';
import { groupBy, max } from 'lodash-es';
import React from 'react';
import ReactWordcloud from 'react-wordcloud';
import { useDebouncedValue } from '@mantine/hooks';
import { NamedData } from '../../types/base';
import type { PlotParams } from 'react-plotly.js';

export interface VisualizationWordCloudItem {
  text: string;
  value: number;
  group?: string;
}

interface VisualizationInternalWordCloudItem
  extends VisualizationWordCloudItem {
  significance: number;
}

interface VisualizationWordCloudRendererProps {
  words: VisualizationWordCloudItem[] | undefined;
  title: string;
  noDataPlaceholder: string;
  valueLabel: string;
  groups?: string[];
}

export function VisualizationWordCloudRenderer(
  props: VisualizationWordCloudRendererProps,
) {
  const { words, title, noDataPlaceholder, groups, valueLabel } = props;

  const colorMap = React.useMemo(() => {
    if (!groups) return undefined;
    return generateColorsFromSequence(groups).colorMap;
  }, [groups]);

  const componentWords = React.useMemo<
    VisualizationInternalWordCloudItem[] | undefined
  >(() => {
    if (!words) return undefined;
    const NOT_A_GROUP = 'NOT_A_GROUP';
    const groupedWords = groupBy(words, (word) =>
      word.group ? word.group.toString() : NOT_A_GROUP,
    );
    const maxWordsPerGroup = Math.max(
      1,
      Math.ceil(50 / Object.keys(groupedWords).length),
    );
    const limitedGroupedWords = Object.values(groupedWords).map((words) =>
      words.slice(0, maxWordsPerGroup),
    );

    return limitedGroupedWords
      .flatMap((words) => {
        const maxValue = words.reduce(
          (acc, cur) => Math.max(acc, cur.value),
          0,
        );
        return words.map((word) => {
          const proportion = word.value / maxValue;
          return {
            ...word,
            value: proportion,
            significance: word.value,
          } as VisualizationInternalWordCloudItem;
        });
      })
      .sort((a, b) => a.value - b.value);
  }, [words]);

  return (
    <>
      <Title order={3} ta="center">
        {title}
      </Title>
      {componentWords ? (
        <div style={{ minHeight: 512, minWidth: 720 }}>
          <ReactWordcloud
            words={componentWords}
            minSize={[720, 512]}
            callbacks={{
              getWordColor: (rawWord) => {
                const word = rawWord as VisualizationInternalWordCloudItem;
                let color: chroma.Color | undefined = undefined;
                if (word.group != null && colorMap) {
                  const definedColor = colorMap.get(word.group);
                  if (definedColor) {
                    color = chroma(definedColor);
                  }
                  // If not, continue below
                }
                if (color === undefined) {
                  // eslint-disable-next-line import/no-named-as-default-member
                  color = chroma.random();
                }
                color.set('lch.c', word.value);
                return color;
              },
              getWordTooltip: (rawWord) => {
                const word = rawWord as VisualizationInternalWordCloudItem;
                const additionalInfo = [`${valueLabel}: ${word.significance}`];
                if (word.group) {
                  additionalInfo.push(`Group: ${word.group}`);
                }
                return `${word.text} (${additionalInfo.join(' | ')})`;
              },
            }}
            options={{
              fontFamily: 'Impact',
              deterministic: true,
              rotations: 0,
              fontSizes: [24, 64],
              enableOptimizations: true,
              scale: 'linear',
            }}
          />
        </div>
      ) : (
        <Alert
          title="Oops, there are no topic words..."
          color="gray"
          icon={<XCircle />}
        >
          {noDataPlaceholder}
        </Alert>
      )}
    </>
  );
}

export function useTopNWordsSlider() {
  const [topNWords, setTopNWords] = React.useState(5);
  const [debouncedTopNWords] = useDebouncedValue(topNWords, 1000, {
    leading: false,
  });
  const Component = (
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
  );
  return { topNWords: debouncedTopNWords, setTopNWords, Component };
}

interface UseVisualizationWordBarChartPlot {
  data: NamedData<[string, number][]>[] | null;
  topNWords: number;
  title: string;
  valueLabel: string;
}

export function useVisualizationWordBarChartPlot(
  props: UseVisualizationWordBarChartPlot,
) {
  const { data, topNWords, title, valueLabel } = props;

  const maxX = React.useMemo(() => {
    return (
      max(data?.map((words) => max(words.data.map((word) => word[1])))) ?? 0
    );
  }, [data]);

  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (!data) return undefined;
    const subplots: PlotParams['data'] = [];
    const { colors } = generateColorsFromSequence(
      data.map((item) => item.name),
    );
    const layouts: any = {};
    for (let i = 0; i < data.length; i++) {
      const color = colors[i]!;
      const focusedData = data[i]!;
      const words = focusedData.data.slice(0, topNWords);
      const y = words.map((word) => word[0]);
      const x = words.map((word) => word[1]);
      y.reverse();
      x.reverse();
      subplots.push({
        x,
        y,
        name: focusedData.name,
        type: 'bar',
        orientation: 'h',
        hovertemplate: `<b>Word</b>: %{y}<br><b>${valueLabel}</b>: %{x}<br>`,
        xaxis: `x${i + 1}`,
        yaxis: `y${i + 1}`,
        marker: {
          color,
        },
      });
      layouts[i === 0 ? 'xaxis' : `xaxis${i + 1}`] = {
        minallowed: 0,
        title: focusedData.name,
        range: [0, maxX],
      };
    }
    const rows = Math.ceil(subplots.length / 3);
    return {
      data: subplots,
      layout: {
        title: {
          text: title,
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
  }, [data, maxX, title, topNWords, valueLabel]);

  return plot;
}
