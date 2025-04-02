import React from 'react';
import { TopicVisualizationRendererProps } from './data-providers';
import ReactWordcloud, { type Word } from 'react-wordcloud';
import { Stack, Title } from '@mantine/core';
import { TopicSelectInput } from '../../components/select-topic-input';
import chroma from 'chroma-js';
import { getTopicLabel } from '@/api/topic';

export function TopicVisualizationWordCloudRenderer(
  props: TopicVisualizationRendererProps,
) {
  const { data } = props;
  const [topic, setTopic] = React.useState(() => {
    return data[0]?.topic ?? null;
  });

  const words = React.useMemo<Word[] | undefined>(() => {
    if (!topic) return undefined;
    const maxValue = topic.words.reduce((acc, cur) => acc + cur[1], 0);
    return topic.words.map((word) => {
      const proportion = word[1] / maxValue;
      return {
        text: word[0],
        value: proportion,
        ctfidf: word[1],
      };
    });
  }, [topic]);

  return (
    <Stack>
      <TopicSelectInput
        data={data.map((item) => item.topic)}
        withOutlier={false}
        value={topic?.id ?? null}
        onChange={setTopic}
        label="Topic"
        description="Choose a topic to view its topic words as a word cloud."
        maw={512}
      />
      {words && (
        <>
          <Title order={3} ta="center">
            Topic Words of {getTopicLabel(topic!)}
          </Title>
          <ReactWordcloud
            words={words}
            minSize={[720, 512]}
            callbacks={{
              getWordColor: (word) => {
                // eslint-disable-next-line import/no-named-as-default-member
                const color = chroma.random();
                color.set('lch.c', word.value);
                return color;
              },
              getWordTooltip: (word) => {
                return `${word.text} (${word.ctfidf.toFixed(3)})`;
              },
            }}
            options={{
              fontFamily: 'Impact',
              deterministic: true,
              rotations: 0,
              fontSizes: [24, 72],
            }}
          />
        </>
      )}
    </Stack>
  );
}
