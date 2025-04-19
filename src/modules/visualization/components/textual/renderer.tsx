import { generateColorsFromSequence } from '@/common/utils/colors';
import { Alert, Title } from '@mantine/core';
import { XCircle } from '@phosphor-icons/react';
import chroma from 'chroma-js';
import { groupBy } from 'lodash-es';
import React from 'react';
import ReactWordcloud from 'react-wordcloud';

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
  groups?: string[];
}

export function VisualizationWordCloudRenderer(
  props: VisualizationWordCloudRendererProps,
) {
  const { words, title, noDataPlaceholder, groups } = props;

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
    return Object.values(groupedWords).flatMap((words) => {
      const maxValue = words.reduce((acc, cur) => acc + cur.value, 0);
      return words.map((word) => {
        const proportion = word.value / maxValue;
        return {
          ...word,
          value: proportion,
          significance: word.value,
        } as VisualizationInternalWordCloudItem;
      });
    });
  }, [words]);

  return (
    <>
      <Title order={3} ta="center">
        {title}
      </Title>
      {componentWords ? (
        <ReactWordcloud
          words={componentWords}
          minSize={[512, 512]}
          callbacks={{
            getWordColor: (rawWord) => {
              const word = rawWord as VisualizationInternalWordCloudItem;
              if (word.group != null && colorMap) {
                const definedColor = colorMap.get(word.group);
                if (definedColor) {
                  return definedColor;
                }
                // If not, continue below
              }
              // eslint-disable-next-line import/no-named-as-default-member
              const color = chroma.random();
              color.set('lch.c', word.value);
              return color;
            },
            getWordTooltip: (rawWord) => {
              const word = rawWord as VisualizationInternalWordCloudItem;
              const additionalInfo = [`Value: ${word.significance}`];
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
            fontSizes: [24, 72],
          }}
        />
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
