import React from 'react';
import { TopicVisualizationRendererProps } from './data-providers';
import ReactWordcloud, { type Word } from 'react-wordcloud';
import { Button, Group, Stack, Title } from '@mantine/core';
import { TopicSelectInput } from '../../components/select-topic-input';
import chroma from 'chroma-js';
import { getTopicLabel } from '@/api/topic';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

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

  const topicIdx = React.useMemo(
    () =>
      !topic ? null : data.findIndex((item) => item.topic.id === topic.id),
    [data, topic],
  );
  const canGoLeft = topicIdx == null || topicIdx > 0;
  const canGoRight = topicIdx == null || topicIdx < data.length - 1;

  console.log('Rerender Topic Word Cloud');

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
        inputContainer={(children) => (
          <Group>
            <Button
              leftSection={<ArrowLeft />}
              disabled={!canGoLeft}
              onClick={() => {
                const newIdx = topicIdx == null ? 0 : topicIdx - 1;
                return setTopic(data[newIdx]?.topic ?? null);
              }}
              variant="subtle"
            >
              Previous
            </Button>
            {children}
            <Button
              rightSection={<ArrowRight />}
              disabled={!canGoRight}
              onClick={() => {
                const newIdx = topicIdx == null ? 0 : topicIdx + 1;
                return setTopic(data[newIdx]?.topic ?? null);
              }}
              variant="subtle"
            >
              Next
            </Button>
          </Group>
        )}
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
