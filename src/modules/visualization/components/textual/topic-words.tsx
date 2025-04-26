import React from 'react';
import { Stack } from '@mantine/core';
import { getTopicLabel, TopicModel } from '@/api/topic';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import {
  VisualizationWordCloudItem,
  VisualizationWordCloudRenderer,
} from '@/modules/visualization/components/textual/renderer';
import { BaseVisualizationComponentProps } from '../../types/base';
import { TopicSelectInput } from '@/modules/topics/components/select-topic-input';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import { useVisualizationSubdatasetsMultiSelect } from '../configuration/subdatasets';

export function VisualizationTopicWordsComponent(
  props: BaseVisualizationComponentProps<TopicModel[], object>,
) {
  const { data, item } = props;

  const topicModelingResult = useTopicModelingResultOfColumn(item.column);

  const [topic, setTopic] = React.useState<TopicModel | null>(null);

  const {
    Component,
    viewedData,
    options: subdatasetNames,
  } = useVisualizationSubdatasetsMultiSelect({ data, limit: 3 });

  const topics = React.useMemo(() => {
    const topicIds = viewedData.flatMap((subdataset) =>
      subdataset.data.map((topic) => topic.id),
    );
    return (
      topicModelingResult?.result?.topics.filter((topic) =>
        topicIds.includes(topic.id),
      ) ?? []
    );
  }, [topicModelingResult?.result?.topics, viewedData]);

  const inputContainer = useSelectLeftRightButtons({
    options: topics,
    onChange: setTopic,
    value: topic,
  });

  const topicWords = React.useMemo(() => {
    return viewedData.flatMap((subdataset) => {
      if (!topic) return [];
      return (
        subdataset.data
          .find((thisTopic) => thisTopic.id === topic.id)
          ?.words.map((word) => {
            return {
              text: word[0],
              value: word[1],
              group: viewedData.length <= 1 ? undefined : subdataset.name,
            } as VisualizationWordCloudItem;
          }) ?? []
      );
    });
  }, [topic, viewedData]);

  return (
    <Stack>
      {Component}
      <TopicSelectInput
        data={topics}
        value={topic?.id}
        withOutlier={false}
        onChange={(topic) => setTopic(topic)}
        label="Topic"
        className="w-full"
        description="Choose a topic to view its topic words as a word cloud."
        inputContainer={inputContainer}
      />
      <VisualizationWordCloudRenderer
        words={topicWords}
        title={
          topic ? `Topic Words of ${getTopicLabel(topic!)}` : 'View Topic Words'
        }
        groups={subdatasetNames}
        noDataPlaceholder="Choose a topic to get started"
      />
    </Stack>
  );
}
