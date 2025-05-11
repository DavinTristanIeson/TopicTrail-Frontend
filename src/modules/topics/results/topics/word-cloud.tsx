import React from 'react';
import { TopicVisualizationRendererProps } from './data-providers';
import { Stack } from '@mantine/core';
import { TopicSelectInput } from '../../components/select-topic-input';
import { getTopicLabel } from '@/api/topic';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import { VisualizationWordCloudRenderer } from '@/modules/visualization/components/textual/renderer';

export function TopicVisualizationWordCloudRenderer(
  props: TopicVisualizationRendererProps,
) {
  const { data: topics } = props;
  const [topic, setTopic] = React.useState(() => {
    return topics[0] ?? null;
  });

  const inputContainer = useSelectLeftRightButtons({
    options: topics,
    onChange: setTopic,
    value: topic,
  });

  return (
    <Stack>
      <TopicSelectInput
        data={topics}
        value={topic?.id}
        withOutlier={false}
        onChange={(topic) => setTopic(topic)}
        label="Topic"
        description="Choose a topic to view its topic words as a word cloud."
        styles={{
          input: {
            width: 512,
          },
        }}
        inputContainer={inputContainer}
      />
      <VisualizationWordCloudRenderer
        words={topic?.words.map((word) => {
          return {
            text: word[0],
            value: word[1],
          };
        })}
        valueLabel="C-TF-IDF Score"
        title={
          topic ? `Topic Words of ${getTopicLabel(topic!)}` : 'View Topic Words'
        }
        noDataPlaceholder="Choose a topic to get started"
      />
    </Stack>
  );
}
